import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const prestamos = await prisma.prestamo.findMany({
      include: {
        libro: true,
        user: true,
      },
      orderBy: { fechaPrestamo: 'desc' },
    })

    return NextResponse.json(prestamos)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener préstamos' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { libroId, userId, fechaLimite, observaciones } = body

    if (!libroId || !userId || !fechaLimite) {
      return NextResponse.json(
        { error: 'Libro, usuario y fecha límite son requeridos' },
        { status: 400 }
      )
    }

    // Verificar disponibilidad del libro
    const libro = await prisma.libro.findUnique({
      where: { id: libroId },
    })

    if (!libro) {
      return NextResponse.json({ error: 'Libro no encontrado' }, { status: 404 })
    }

    if (libro.disponible <= 0) {
      return NextResponse.json(
        { error: 'No hay ejemplares disponibles de este libro' },
        { status: 400 }
      )
    }

    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Crear préstamo y actualizar disponibilidad
    const prestamo = await prisma.$transaction(async (tx) => {
      const nuevoPrestamo = await tx.prestamo.create({
        data: {
          libroId,
          userId,
          fechaLimite: new Date(fechaLimite),
          observaciones: observaciones || null,
        },
      })

      await tx.libro.update({
        where: { id: libroId },
        data: { disponible: { decrement: 1 } },
      })

      return nuevoPrestamo
    })

    return NextResponse.json(prestamo, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al crear el préstamo' },
      { status: 500 }
    )
  }
}

