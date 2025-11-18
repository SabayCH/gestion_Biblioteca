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
        operador: true,
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
    const { libroId, nombrePrestatario, dni, email, fechaLimite, observaciones } = body

    // VALIDACIÓN 1: Campos obligatorios
    if (!libroId || !nombrePrestatario || !dni || !fechaLimite) {
      return NextResponse.json(
        { error: 'Libro, nombre del prestatario, DNI y fecha límite son requeridos' },
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

    // VALIDACIÓN 2: Validar morosos por DNI
    const prestamoExistente = await prisma.prestamo.findFirst({
      where: {
        dni: dni.trim(), // Usar trim para evitar espacios
        estado: 'ACTIVO',
      },
    })

    if (prestamoExistente) {
      return NextResponse.json(
        { error: `El usuario con DNI ${dni} ya tiene un libro pendiente` },
        { status: 400 }
      )
    }

    // Crear préstamo, actualizar disponibilidad y registrar auditoría
    const prestamo = await prisma.$transaction(async (tx) => {
      const nuevoPrestamo = await tx.prestamo.create({
        data: {
          libroId,
          usuarioId: session.user.id, // Operador responsable
          nombrePrestatario: nombrePrestatario.trim(),
          dni: dni.trim(), // Guardar como String para preservar ceros a la izquierda
          email: email?.trim() || null,
          fechaLimite: new Date(fechaLimite),
          observaciones: observaciones?.trim() || null,
        },
      })

      await tx.libro.update({
        where: { id: libroId },
        data: { disponible: { decrement: 1 } },
      })

      // Registrar en auditoría
      await tx.auditLog.create({
        data: {
          action: 'CREAR',
          entity: 'Prestamo',
          entityId: nuevoPrestamo.id,
          usuarioId: session.user.id,
          detalles: `Préstamo creado: ${libro.titulo} para ${nombrePrestatario} (DNI: ${dni})`,
        },
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


