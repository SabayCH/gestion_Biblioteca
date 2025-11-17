import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const prestamoId = params.id

    const prestamo = await prisma.prestamo.findUnique({
      where: { id: prestamoId },
    })

    if (!prestamo) {
      return NextResponse.json({ error: 'Préstamo no encontrado' }, { status: 404 })
    }

    if (prestamo.estado === 'DEVUELTO') {
      return NextResponse.json(
        { error: 'Este préstamo ya fue devuelto' },
        { status: 400 }
      )
    }

    // Actualizar préstamo y disponibilidad del libro
    const updated = await prisma.$transaction(async (tx) => {
      const prestamoActualizado = await tx.prestamo.update({
        where: { id: prestamoId },
        data: {
          estado: 'DEVUELTO',
          fechaDevolucion: new Date(),
        },
      })

      await tx.libro.update({
        where: { id: prestamo.libroId },
        data: { disponible: { increment: 1 } },
      })

      return prestamoActualizado
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al devolver el préstamo' },
      { status: 500 }
    )
  }
}

