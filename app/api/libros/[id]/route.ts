import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const libroUpdateSchema = z.object({
    fechaRegistro: z.string().optional().nullable(),
    numeroRegistro: z.string().optional().nullable(),
    titulo: z.string().min(1, { message: 'Título es requerido' }).optional(),
    autor: z.string().optional().nullable(),
    cantidad: z.number().int().min(1).optional(),
    disponible: z.number().int().min(0).optional(),
})

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const libro = await prisma.libro.findUnique({
            where: { id: params.id },
        })

        if (!libro) {
            return NextResponse.json({ error: 'Libro no encontrado' }, { status: 404 })
        }

        return NextResponse.json(libro)
    } catch (error) {
        return NextResponse.json(
            { error: 'Error al obtener el libro' },
            { status: 500 }
        )
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const body = await request.json()
        const parsedBody = libroUpdateSchema.safeParse(body)

        if (!parsedBody.success) {
            return NextResponse.json({ error: parsedBody.error.issues }, { status: 400 })
        }

        const data = parsedBody.data

        // Verificar si el libro existe
        const libroExistente = await prisma.libro.findUnique({
            where: { id: params.id },
        })

        if (!libroExistente) {
            return NextResponse.json({ error: 'Libro no encontrado' }, { status: 404 })
        }

        // Preparar datos para actualización
        const updateData: any = { ...data }

        // Si viene fechaRegistro, convertirla
        if (data.fechaRegistro) {
            updateData.fechaRegistro = new Date(data.fechaRegistro)
        }

        // Si se actualiza la cantidad total, ajustar la disponibilidad
        // Esto es una lógica simple, podría ser más compleja dependiendo de los préstamos activos
        if (data.cantidad !== undefined && data.cantidad !== libroExistente.cantidad) {
            const diferencia = data.cantidad - libroExistente.cantidad
            updateData.disponible = libroExistente.disponible + diferencia
        }

        const libroActualizado = await prisma.libro.update({
            where: { id: params.id },
            data: updateData,
        })

        // Registrar auditoría
        await prisma.auditLog.create({
            data: {
                action: 'ACTUALIZAR',
                entity: 'Libro',
                entityId: libroActualizado.id,
                usuarioId: session.user.id,
                detalles: `Libro actualizado: ${libroActualizado.titulo}`,
            },
        })

        return NextResponse.json(libroActualizado)
    } catch (error) {
        console.error(error)
        return NextResponse.json(
            { error: 'Error al actualizar el libro' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        // Verificar préstamos activos
        const prestamosActivos = await prisma.prestamo.count({
            where: {
                libroId: params.id,
                estado: 'ACTIVO',
            },
        })

        if (prestamosActivos > 0) {
            return NextResponse.json(
                { error: 'No se puede eliminar el libro porque tiene préstamos activos' },
                { status: 400 }
            )
        }

        const libroEliminado = await prisma.libro.delete({
            where: { id: params.id },
        })

        // Registrar auditoría
        await prisma.auditLog.create({
            data: {
                action: 'ELIMINAR',
                entity: 'Libro',
                entityId: params.id,
                usuarioId: session.user.id,
                detalles: `Libro eliminado: ${libroEliminado.titulo}`,
            },
        })

        return NextResponse.json({ message: 'Libro eliminado correctamente' })
    } catch (error) {
        console.error(error)
        return NextResponse.json(
            { error: 'Error al eliminar el libro' },
            { status: 500 }
        )
    }
}
