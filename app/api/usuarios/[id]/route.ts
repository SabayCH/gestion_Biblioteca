import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

const userUpdateSchema = z.object({
    name: z.string().min(1, 'El nombre es requerido').optional(),
    email: z.string().email('Email inválido').optional(),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional(),
    role: z.enum(['ADMIN', 'USER']).optional(),
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

        const usuario = await prisma.user.findUnique({
            where: { id: params.id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                // Excluir password
            },
        })

        if (!usuario) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
        }

        return NextResponse.json(usuario)
    } catch (error) {
        return NextResponse.json(
            { error: 'Error al obtener el usuario' },
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

        // Validar permisos: Solo ADMIN o el mismo usuario pueden editar
        // Nota: TypeScript puede quejarse si session.user no tiene role/id tipados explícitamente, 
        // pero asumimos que están disponibles como en otros archivos.
        const userRole = (session.user as any).role
        const userId = (session.user as any).id

        if (userRole !== 'ADMIN' && userId !== params.id) {
            return NextResponse.json({ error: 'No tienes permisos para editar este usuario' }, { status: 403 })
        }

        const body = await request.json()
        const parsedBody = userUpdateSchema.safeParse(body)

        if (!parsedBody.success) {
            return NextResponse.json({ error: parsedBody.error.issues }, { status: 400 })
        }

        const data = parsedBody.data
        const updateData: any = {}

        if (data.name) updateData.name = data.name
        if (data.email) updateData.email = data.email

        // Solo ADMIN puede cambiar roles
        if (data.role) {
            if (userRole !== 'ADMIN') {
                return NextResponse.json({ error: 'Solo los administradores pueden cambiar roles' }, { status: 403 })
            }
            updateData.role = data.role
        }

        // Si hay contraseña, hashearla
        if (data.password) {
            updateData.password = await bcrypt.hash(data.password, 12)
        }

        const usuarioActualizado = await prisma.user.update({
            where: { id: params.id },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
            },
        })

        // Registrar auditoría
        await prisma.auditLog.create({
            data: {
                action: 'ACTUALIZAR',
                entity: 'User',
                entityId: usuarioActualizado.id,
                usuarioId: userId,
                detalles: `Usuario actualizado: ${usuarioActualizado.email}`,
            },
        })

        return NextResponse.json(usuarioActualizado)
    } catch (error) {
        console.error(error)
        return NextResponse.json(
            { error: 'Error al actualizar el usuario' },
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

        const userRole = (session.user as any).role
        const userId = (session.user as any).id

        // Solo ADMIN puede eliminar usuarios
        if (userRole !== 'ADMIN') {
            return NextResponse.json({ error: 'Solo los administradores pueden eliminar usuarios' }, { status: 403 })
        }

        // No se puede eliminar a uno mismo
        if (userId === params.id) {
            return NextResponse.json({ error: 'No puedes eliminar tu propia cuenta' }, { status: 400 })
        }

        // Verificar préstamos activos como operador
        const prestamosActivos = await prisma.prestamo.count({
            where: { usuarioId: params.id, estado: 'ACTIVO' }
        })

        if (prestamosActivos > 0) {
            return NextResponse.json({ error: 'No se puede eliminar usuario con préstamos activos registrados a su nombre' }, { status: 400 })
        }

        const usuarioEliminado = await prisma.user.delete({
            where: { id: params.id },
        })

        // Registrar auditoría
        await prisma.auditLog.create({
            data: {
                action: 'ELIMINAR',
                entity: 'User',
                entityId: params.id,
                usuarioId: userId,
                detalles: `Usuario eliminado: ${usuarioEliminado.email}`,
            },
        })

        return NextResponse.json({ message: 'Usuario eliminado correctamente' })
    } catch (error) {
        console.error(error)
        return NextResponse.json(
            { error: 'Error al eliminar el usuario' },
            { status: 500 }
        )
    }
}
