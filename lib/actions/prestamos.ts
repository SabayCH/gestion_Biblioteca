/**
 * SERVER ACTIONS PARA PRÉSTAMOS
 * 
 * Este archivo centraliza toda la lógica de negocio relacionada con préstamos
 * usando Server Actions de Next.js 14, eliminando la necesidad de API Routes.
 * 
 * ✅ Validación con Zod
 * ✅ Transacciones atómicas con Prisma
 * ✅ Revalidación automática de rutas
 * ✅ Type-safe
 */

'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { type ServerActionResponse, type PrestamoConRelaciones } from '@/types'

// ==================== SCHEMAS DE VALIDACIÓN ====================

const crearPrestamoSchema = z.object({
    libroId: z.string().min(1, 'El libro es requerido'),
    nombrePrestatario: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').trim(),
    dni: z.string().min(5, 'El DNI debe tener al menos 5 caracteres').trim(),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    fechaLimite: z.string().min(1, 'La fecha límite es requerida'),
    observaciones: z.string().optional(),
})

const devolverPrestamoSchema = z.object({
    prestamoId: z.string().min(1, 'El ID del préstamo es requerido'),
    observaciones: z.string().optional(),
})

// ==================== ACCIONES ====================

/**
 * Crear un nuevo préstamo
 * 
 * Validaciones:
 * - Verifica que el usuario esté autenticado
 * - Valida datos con Zod
 * - Verifica disponibilidad del libro
 * - Verifica que el prestatario no tenga préstamos activos
 * - Crea el préstamo en una transacción atómica
 * - Decrementa la disponibilidad del libro
 * - Registra la acción en auditoría
 */
export async function crearPrestamo(
    formData: FormData | Record<string, any>
): Promise<ServerActionResponse<PrestamoConRelaciones>> {
    try {
        // 1. Verificar autenticación
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return {
                success: false,
                error: 'No autorizado. Debes iniciar sesión.',
            }
        }

        // 2. Extraer y parsear datos
        const rawData = formData instanceof FormData
            ? Object.fromEntries(formData)
            : formData

        const validacion = crearPrestamoSchema.safeParse(rawData)

        if (!validacion.success) {
            return {
                success: false,
                error: 'Datos inválidos',
                errors: validacion.error.flatten().fieldErrors,
            }
        }

        const { libroId, nombrePrestatario, dni, email, fechaLimite, observaciones } = validacion.data

        // 3. Verificar disponibilidad del libro
        const libro = await prisma.libro.findUnique({
            where: { id: libroId },
        })

        if (!libro) {
            return {
                success: false,
                error: 'Libro no encontrado',
            }
        }

        if (libro.disponible <= 0) {
            return {
                success: false,
                error: `No hay ejemplares disponibles de "${libro.titulo}"`,
            }
        }

        // 4. Verificar que el prestatario no tenga préstamos activos (validación de morosos)
        const prestamoExistente = await prisma.prestamo.findFirst({
            where: {
                dni: dni,
                estado: 'ACTIVO',
            },
        })

        if (prestamoExistente) {
            return {
                success: false,
                error: `El usuario con DNI ${dni} ya tiene un libro pendiente de devolución`,
            }
        }

        // 5. Crear préstamo en transacción atómica
        const prestamo = await prisma.$transaction(async (tx) => {
            // Crear préstamo
            const nuevoPrestamo = await tx.prestamo.create({
                data: {
                    libroId,
                    usuarioId: session.user.id,
                    nombrePrestatario,
                    dni,
                    email: email || null,
                    fechaLimite: new Date(fechaLimite),
                    observaciones: observaciones || null,
                },
                include: {
                    libro: true,
                    operador: true,
                },
            })

            // Decrementar disponibilidad
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

        // 6. Revalidar rutas afectadas
        revalidatePath('/dashboard/prestamos')
        revalidatePath('/dashboard/inventario')

        return {
            success: true,
            data: prestamo,
        }
    } catch (error: any) {
        console.error('Error al crear préstamo:', error)
        return {
            success: false,
            error: error.message || 'Error inesperado al crear el préstamo',
        }
    }
}

/**
 * Devolver un préstamo
 * 
 * - Verifica autenticación
 * - Marca el préstamo como DEVUELTO
 * - Incrementa la disponibilidad del libro
 * - Registra en auditoría
 */
export async function devolverPrestamo(
    formData: FormData | Record<string, any>
): Promise<ServerActionResponse<PrestamoConRelaciones>> {
    try {
        // 1. Verificar autenticación
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return {
                success: false,
                error: 'No autorizado',
            }
        }

        // 2. Validar datos
        const rawData = formData instanceof FormData
            ? Object.fromEntries(formData)
            : formData

        const validacion = devolverPrestamoSchema.safeParse(rawData)

        if (!validacion.success) {
            return {
                success: false,
                error: 'Datos inválidos',
                errors: validacion.error.flatten().fieldErrors,
            }
        }

        const { prestamoId, observaciones } = validacion.data

        // 3. Verificar que el préstamo existe
        const prestamoExistente = await prisma.prestamo.findUnique({
            where: { id: prestamoId },
            include: {
                libro: true,
            },
        })

        if (!prestamoExistente) {
            return {
                success: false,
                error: 'Préstamo no encontrado',
            }
        }

        if (prestamoExistente.estado === 'DEVUELTO') {
            return {
                success: false,
                error: 'Este préstamo ya fue devuelto',
            }
        }

        // 4. Devolver en transacción
        const prestamo = await prisma.$transaction(async (tx) => {
            // Actualizar préstamo
            const prestamoActualizado = await tx.prestamo.update({
                where: { id: prestamoId },
                data: {
                    estado: 'DEVUELTO',
                    fechaDevolucion: new Date(),
                    observaciones: observaciones
                        ? `${prestamoExistente.observaciones || ''}\n[Devolución] ${observaciones}`.trim()
                        : prestamoExistente.observaciones,
                },
                include: {
                    libro: true,
                    operador: true,
                },
            })

            // Incrementar disponibilidad
            await tx.libro.update({
                where: { id: prestamoExistente.libroId },
                data: { disponible: { increment: 1 } },
            })

            // Auditoría
            await tx.auditLog.create({
                data: {
                    action: 'DEVOLVER',
                    entity: 'Prestamo',
                    entityId: prestamoId,
                    usuarioId: session.user.id,
                    detalles: `Libro devuelto: ${prestamoExistente.libro.titulo} de ${prestamoExistente.nombrePrestatario}`,
                },
            })

            return prestamoActualizado
        })

        // 5. Revalidar
        revalidatePath('/dashboard/prestamos')
        revalidatePath('/dashboard/inventario')

        return {
            success: true,
            data: prestamo,
        }
    } catch (error: any) {
        console.error('Error al devolver préstamo:', error)
        return {
            success: false,
            error: error.message || 'Error inesperado al devolver el préstamo',
        }
    }
}

/**
 * Obtener todos los préstamos (con relaciones)
 * Este es un helper para Server Components
 */
export async function obtenerPrestamos(): Promise<PrestamoConRelaciones[]> {
    const prestamos = await prisma.prestamo.findMany({
        include: {
            libro: true,
            operador: true,
        },
        orderBy: { fechaPrestamo: 'desc' },
    })

    return prestamos
}
