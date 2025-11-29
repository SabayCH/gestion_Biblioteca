/**
 * SERVER ACTIONS PARA USUARIOS
 * 
 * Gestión completa de usuarios con validación estricta de permisos.
 * Solo usuarios con rol ADMIN pueden crear o eliminar usuarios.
 * 
 * ✅ Validación con Zod
 * ✅ Control de acceso por rol
 * ✅ Hash seguro de contraseñas
 * ✅ Auditoría automática
 */

'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import * as bcrypt from 'bcryptjs'
import { type ServerActionResponse, type Usuario } from '@/types'

// ==================== SCHEMAS DE VALIDACIÓN ====================

const crearUsuarioSchema = z.object({
    name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').trim(),
    email: z.string().email('Email inválido').toLowerCase().trim(),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    role: z.enum(['ADMIN', 'USER'], {
        message: 'El rol debe ser ADMIN o USER'
    }),
})

const eliminarUsuarioSchema = z.object({
    usuarioId: z.string().min(1, 'El ID del usuario es requerido'),
})

// ==================== HELPERS ====================

/**
 * Verifica que el usuario autenticado sea ADMIN
 */
async function verificarAdmin(): Promise<{ success: false; error: string } | { success: true; userId: string }> {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        return {
            success: false,
            error: 'No autorizado. Debes iniciar sesión.',
        }
    }

    if (session.user.role !== 'ADMIN') {
        return {
            success: false,
            error: 'Acceso denegado. Solo administradores pueden realizar esta acción.',
        }
    }

    return {
        success: true,
        userId: session.user.id,
    }
}

// ==================== ACCIONES ====================

/**
 * Crear un nuevo usuario
 * 
 * Validaciones:
 * - Solo ADMIN puede crear usuarios
 * - Email único
 * - Contraseña hasheada con bcrypt
 * - Registra auditoría
 */
export async function crearUsuario(
    formData: FormData | Record<string, any>
): Promise<ServerActionResponse<Usuario>> {
    try {
        // 1. Verificar que sea ADMIN
        const adminCheck = await verificarAdmin()
        if (!adminCheck.success) {
            return {
                success: false,
                error: adminCheck.error,
            }
        }

        // 2. Extraer y validar datos
        const rawData = formData instanceof FormData
            ? Object.fromEntries(formData)
            : formData

        const validacion = crearUsuarioSchema.safeParse(rawData)

        if (!validacion.success) {
            return {
                success: false,
                error: 'Datos inválidos',
                errors: validacion.error.flatten().fieldErrors,
            }
        }

        const { name, email, password, role } = validacion.data

        // 3. Verificar que el email no exista
        const existente = await prisma.user.findUnique({
            where: { email },
        })

        if (existente) {
            return {
                success: false,
                error: `Ya existe un usuario con el email ${email}`,
            }
        }

        // 4. Hashear contraseña
        const hashedPassword = await bcrypt.hash(password, 10)

        // 5. Crear usuario y registrar auditoría en transacción
        const usuario = await prisma.$transaction(async (tx) => {
            // Crear usuario
            const nuevoUsuario = await tx.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    role,
                },
            })

            // Registrar en auditoría
            await tx.auditLog.create({
                data: {
                    action: 'CREAR',
                    entity: 'User',
                    entityId: nuevoUsuario.id,
                    usuarioId: adminCheck.userId,
                    detalles: `Usuario creado: ${email} con rol ${role}`,
                },
            })

            return nuevoUsuario
        })

        // 6. Revalidar rutas afectadas
        revalidatePath('/dashboard/usuarios')

        // 7. Retornar usuario sin contraseña
        const { password: _, ...usuarioSinPassword } = usuario

        return {
            success: true,
            data: usuarioSinPassword as Usuario,
        }
    } catch (error: any) {
        console.error('Error al crear usuario:', error)
        return {
            success: false,
            error: error.message || 'Error inesperado al crear el usuario',
        }
    }
}

/**
 * Eliminar un usuario
 * 
 * Validaciones:
 * - Solo ADMIN puede eliminar
 * - No puede eliminarse a sí mismo
 * - Registra auditoría
 */
export async function eliminarUsuario(
    formData: FormData | Record<string, any>
): Promise<ServerActionResponse<void>> {
    try {
        // 1. Verificar que sea ADMIN
        const adminCheck = await verificarAdmin()
        if (!adminCheck.success) {
            return {
                success: false,
                error: adminCheck.error,
            }
        }

        // 2. Validar datos
        const rawData = formData instanceof FormData
            ? Object.fromEntries(formData)
            : formData

        const validacion = eliminarUsuarioSchema.safeParse(rawData)

        if (!validacion.success) {
            return {
                success: false,
                error: 'Datos inválidos',
                errors: validacion.error.flatten().fieldErrors,
            }
        }

        const { usuarioId } = validacion.data

        // 3. Verificar que no se elimine a sí mismo
        if (usuarioId === adminCheck.userId) {
            return {
                success: false,
                error: 'No puedes eliminar tu propia cuenta',
            }
        }

        // 4. Verificar que el usuario existe y obtener sus relaciones
        const usuario = await prisma.user.findUnique({
            where: { id: usuarioId },
            include: {
                prestamosOperador: {
                    select: { id: true }
                },
                auditLogs: {
                    select: { id: true }
                }
            }
        })

        if (!usuario) {
            return {
                success: false,
                error: 'Usuario no encontrado',
            }
        }

        // 5. Verificar que no tenga préstamos asociados
        if (usuario.prestamosOperador.length > 0) {
            return {
                success: false,
                error: `No se puede eliminar. El usuario tiene ${usuario.prestamosOperador.length} préstamo(s) registrado(s). Primero debe eliminar o reasignar esos préstamos.`,
            }
        }

        // 6. Nota: Las auditorías se mantienen para historial, pero eliminamos la FK
        // Si hay auditorías, las actualizamos para establecer el usuarioId a NULL o al admin actual
        const tieneAuditorias = usuario.auditLogs.length > 0

        // 7. Eliminar usuario y manejar auditorías
        await prisma.$transaction(async (tx) => {
            // Si tiene auditorías, actualizar el usuarioId a NULL para mantener el historial
            if (tieneAuditorias) {
                await tx.auditLog.updateMany({
                    where: { usuarioId: usuarioId },
                    data: { usuarioId: adminCheck.userId } // Reasignar al admin que elimina
                })
            }

            // Eliminar usuario
            await tx.user.delete({
                where: { id: usuarioId },
            })

            // Registrar en auditoría
            await tx.auditLog.create({
                data: {
                    action: 'ELIMINAR',
                    entity: 'User',
                    entityId: usuarioId,
                    usuarioId: adminCheck.userId,
                    detalles: `Usuario eliminado: ${usuario.email} (${usuario.name})`,
                },
            })
        })

        // 6. Revalidar
        revalidatePath('/dashboard/usuarios')

        return {
            success: true,
        }
    } catch (error: any) {
        console.error('Error al eliminar usuario:', error)
        return {
            success: false,
            error: error.message || 'Error inesperado al eliminar el usuario',
        }
    }
}

/**
 * Obtener todos los usuarios (sin contraseñas)
 * Helper para Server Components
 */
export async function obtenerUsuarios(): Promise<Omit<Usuario, 'password'>[]> {
    const usuarios = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            updatedAt: true,
            prestamosOperador: false,
            auditLogs: false,
            password: false, // Explícitamente excluir
        },
        orderBy: { createdAt: 'desc' },
    })

    return usuarios
}

/**
 * Obtener un usuario por ID (sin contraseña)
 */
export async function obtenerUsuarioPorId(id: string): Promise<Omit<Usuario, 'password'> | null> {
    const usuario = await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            updatedAt: true,
            prestamosOperador: false,
            auditLogs: false,
            password: false,
        },
    })

    return usuario
}

const actualizarUsuarioSchema = z.object({
    id: z.string(),
    name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').trim(),
    email: z.string().email('Email inválido').toLowerCase().trim(),
    password: z.string().optional(),
    role: z.enum(['ADMIN', 'USER']).optional(),
})

/**
 * Actualizar un usuario
 */
export async function actualizarUsuario(
    formData: FormData | Record<string, any>
): Promise<ServerActionResponse<Usuario>> {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return { success: false, error: 'No autorizado' }
        }

        const rawData = formData instanceof FormData
            ? Object.fromEntries(formData)
            : formData

        const validacion = actualizarUsuarioSchema.safeParse(rawData)

        if (!validacion.success) {
            return {
                success: false,
                error: 'Datos inválidos',
                errors: validacion.error.flatten().fieldErrors,
            }
        }

        const { id, name, email, password, role } = validacion.data

        // Verificar permisos: Admin o el mismo usuario
        const isAdmin = session.user.role === 'ADMIN'
        const isSelf = session.user.id === id

        if (!isAdmin && !isSelf) {
            return { success: false, error: 'No tienes permisos para editar este usuario' }
        }

        // Verificar si el email ya existe en otro usuario
        const existente = await prisma.user.findFirst({
            where: {
                email,
                NOT: { id }
            }
        })

        if (existente) {
            return { success: false, error: 'El email ya está en uso por otro usuario' }
        }

        // Preparar datos de actualización
        const updateData: any = { name, email }

        // Solo actualizar password si se proporciona y es válido
        if (password && password.length >= 6) {
            updateData.password = await bcrypt.hash(password, 10)
        }

        // Solo admin puede cambiar rol
        if (isAdmin && role) {
            updateData.role = role
        }

        const usuario = await prisma.user.update({
            where: { id },
            data: updateData,
        })

        // Auditoría
        await prisma.auditLog.create({
            data: {
                action: 'ACTUALIZAR',
                entity: 'User',
                entityId: id,
                usuarioId: session.user.id,
                detalles: `Usuario actualizado: ${email}`,
            },
        })

        revalidatePath('/dashboard/usuarios')

        const { password: _, ...usuarioSinPassword } = usuario
        return { success: true, data: usuarioSinPassword as Usuario }

    } catch (error: any) {
        console.error('Error al actualizar usuario:', error)
        return { success: false, error: error.message || 'Error al actualizar usuario' }
    }
}
