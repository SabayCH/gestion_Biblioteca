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
    libroId: z.array(z.string()).min(1, 'Debes seleccionar al menos un libro'),
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

export async function crearPrestamo(
    formData: FormData | Record<string, any>
): Promise<ServerActionResponse<PrestamoConRelaciones[]>> {
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
        let rawData: any
        if (formData instanceof FormData) {
            rawData = Object.fromEntries(formData)
            // Asegurar que libroId sea un array
            const librosIds = formData.getAll('libroId')
            // Si solo hay uno, getAll devuelve array de 1. Si no hay, array vacío.
            rawData.libroId = librosIds.length > 0 ? librosIds : []
        } else {
            rawData = formData
        }

        const validacion = crearPrestamoSchema.safeParse(rawData)

        if (!validacion.success) {
            return {
                success: false,
                error: 'Datos inválidos',
                errors: validacion.error.flatten().fieldErrors,
            }
        }

        const { libroId: librosIds, nombrePrestatario, dni, email, fechaLimite, observaciones } = validacion.data

        // 3. Verificar disponibilidad de TODOS los libros
        const libros = await prisma.libro.findMany({
            where: { id: { in: librosIds } },
        })

        if (libros.length !== librosIds.length) {
            return {
                success: false,
                error: 'Uno o más libros seleccionados no existen',
            }
        }

        for (const libro of libros) {
            if (libro.disponible <= 0) {
                return {
                    success: false,
                    error: `No hay ejemplares disponibles de "${libro.titulo}"`,
                }
            }
        }

        // 4. Verificar límite de préstamos por usuario
        const prestamosActivos = await prisma.prestamo.count({
            where: {
                dni: dni,
                estado: 'ACTIVO',
            },
        })

        if (prestamosActivos + librosIds.length > 3) {
            return {
                success: false,
                error: `El usuario ya tiene ${prestamosActivos} préstamos activos. No puede llevar ${librosIds.length} más (Máximo 3).`,
            }
        }

        // 5. Crear préstamos en transacción atómica
        const nuevosPrestamos = await prisma.$transaction(async (tx) => {
            const resultados = []

            for (const idLibro of librosIds) {
                const libro = libros.find(l => l.id === idLibro)!

                // Crear préstamo
                const nuevoPrestamo = await tx.prestamo.create({
                    data: {
                        libroId: idLibro,
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
                    where: { id: idLibro },
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

                resultados.push(nuevoPrestamo)
            }

            return resultados
        })

        // 6. Revalidar rutas afectadas
        revalidatePath('/dashboard/prestamos')
        revalidatePath('/dashboard/inventario')

        return {
            success: true,
            data: nuevosPrestamos,
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

/**
 * Obtener préstamos por rango de fechas para reportes
 */
export async function obtenerPrestamosPorRango(fechaInicio: Date, fechaFin: Date) {
    // Ajustar fecha fin al final del día
    const fin = new Date(fechaFin)
    fin.setHours(23, 59, 59, 999)

    const prestamos = await prisma.prestamo.findMany({
        where: {
            fechaPrestamo: {
                gte: fechaInicio,
                lte: fin,
            },
        },
        include: {
            libro: true,
            operador: true,
        },
        orderBy: { fechaPrestamo: 'desc' },
    })

    // Formatear para Excel
    return prestamos.map(p => ({
        'Libro': p.libro.titulo,
        'Autor': p.libro.autor,
        'Código': p.libro.numeroRegistro || '-',
        'Prestatario': p.nombrePrestatario,
        'DNI': p.dni,
        'Email': p.email || '-',
        'Fecha Préstamo': p.fechaPrestamo.toLocaleDateString('es-ES'),
        'Fecha Límite': p.fechaLimite.toLocaleDateString('es-ES'),
        'Fecha Devolución': p.fechaDevolucion ? p.fechaDevolucion.toLocaleDateString('es-ES') : '-',
        'Estado': p.estado,
        'Operador': p.operador.name,
        'Observaciones': p.observaciones || '-',
    }))
}
