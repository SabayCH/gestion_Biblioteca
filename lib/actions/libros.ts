/**
 * SERVER ACTIONS PARA LIBROS
 * 
 * Gestión completa de libros del inventario.
 * 
 * ✅ Validación con Zod
 * ✅ Número consecutivo automático
 * ✅ Búsqueda flexible
 * ✅ Revalidación automática
 */

'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { type ServerActionResponse, type Libro } from '@/types'

// ==================== SCHEMAS DE VALIDACIÓN ====================

const crearLibroSchema = z.object({
    titulo: z.string().min(1, 'El título es requerido').trim(),
    autor: z.string().optional().nullable(),
    sigTop: z.string().optional().nullable(),
    numeroRegistro: z.string().optional().nullable(),
    edicion: z.string().optional().nullable(),
    fechaRegistro: z.string().optional().nullable(),
    cantidad: z.coerce.number().int().min(1, 'La cantidad debe ser al menos 1'),
})

const actualizarLibroSchema = z.object({
    id: z.string().min(1, 'El ID es requerido'),
    titulo: z.string().min(1, 'El título es requerido').trim().optional(),
    autor: z.string().optional().nullable(),
    sigTop: z.string().optional().nullable(),
    numeroRegistro: z.string().optional().nullable(),
    edicion: z.string().optional().nullable(),
    fechaRegistro: z.string().optional().nullable(),
    cantidad: z.coerce.number().int().min(1).optional(),
})

// ==================== ACCIONES ====================

/**
 * Crear un nuevo libro
 * 
 * - Calcula automáticamente el número consecutivo
 * - Valida con Zod
 * - Inicializa disponible = cantidad
 */
export async function crearLibro(
    formData: FormData | Record<string, any>
): Promise<ServerActionResponse<Libro>> {
    try {
        // 1. Verificar autenticación
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return {
                success: false,
                error: 'No autorizado. Debes iniciar sesión.',
            }
        }

        // 2. Extraer y validar datos
        const rawData = formData instanceof FormData
            ? Object.fromEntries(formData)
            : formData

        const validacion = crearLibroSchema.safeParse(rawData)

        if (!validacion.success) {
            return {
                success: false,
                error: 'Datos inválidos',
                errors: validacion.error.flatten().fieldErrors,
            }
        }

        const { titulo, autor, sigTop, numeroRegistro, edicion, fechaRegistro, cantidad } = validacion.data

        // 3. Calcular el siguiente número consecutivo
        const ultimoLibro = await prisma.libro.findFirst({
            orderBy: { numero: 'desc' },
            select: { numero: true },
        })
        const siguienteNumero = (ultimoLibro?.numero || 0) + 1

        // 4. Convertir fechaRegistro a Date si existe
        const fechaRegistroDate = fechaRegistro ? new Date(fechaRegistro) : null

        // 5. Crear libro
        const libro = await prisma.libro.create({
            data: {
                numero: siguienteNumero,
                titulo,
                autor: autor || null,
                sigTop: sigTop || null,
                numeroRegistro: numeroRegistro || null,
                edicion: edicion || null,
                fechaRegistro: fechaRegistroDate,
                cantidad,
                disponible: cantidad, // Inicialmente todos disponibles
            },
        })

        // 6. Revalidar rutas
        revalidatePath('/dashboard/inventario')

        return {
            success: true,
            data: libro,
        }
    } catch (error: any) {
        console.error('Error al crear libro:', error)
        return {
            success: false,
            error: error.message || 'Error inesperado al crear el libro',
        }
    }
}

/**
 * Actualizar un libro existente
 * 
 * - Solo actualiza campos proporcionados
 * - Valida con Zod
 * - Preserva número consecutivo
 */
export async function actualizarLibro(
    formData: FormData | Record<string, any>
): Promise<ServerActionResponse<Libro>> {
    try {
        // 1. Verificar autenticación
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return {
                success: false,
                error: 'No autorizado. Debes iniciar sesión.',
            }
        }

        // 2. Extraer y validar datos
        const rawData = formData instanceof FormData
            ? Object.fromEntries(formData)
            : formData

        const validacion = actualizarLibroSchema.safeParse(rawData)

        if (!validacion.success) {
            return {
                success: false,
                error: 'Datos inválidos',
                errors: validacion.error.flatten().fieldErrors,
            }
        }

        const { id, titulo, autor, fechaRegistro, numeroRegistro, cantidad } = validacion.data

        // 3. Verificar que el libro existe
        const libroExistente = await prisma.libro.findUnique({
            where: { id },
        })

        if (!libroExistente) {
            return {
                success: false,
                error: 'Libro no encontrado',
            }
        }

        // 4. Construir datos de actualización
        const updateData: any = {}
        if (titulo !== undefined) updateData.titulo = titulo
        if (autor !== undefined) updateData.autor = autor || null
        if (fechaRegistro !== undefined) {
            updateData.fechaRegistro = fechaRegistro ? new Date(fechaRegistro) : null
        }
        if (numeroRegistro !== undefined) updateData.numeroRegistro = numeroRegistro || null

        // Si se actualiza la cantidad, ajustar disponible proporcionalmente
        if (cantidad !== undefined) {
            const diferencia = cantidad - libroExistente.cantidad
            updateData.cantidad = cantidad
            updateData.disponible = Math.max(0, libroExistente.disponible + diferencia)
        }

        // 5. Actualizar libro
        const libro = await prisma.libro.update({
            where: { id },
            data: updateData,
        })

        // 6. Revalidar rutas
        revalidatePath('/dashboard/inventario')
        revalidatePath(`/dashboard/inventario/${id}/editar`)

        return {
            success: true,
            data: libro,
        }
    } catch (error: any) {
        console.error('Error al actualizar libro:', error)
        return {
            success: false,
            error: error.message || 'Error inesperado al actualizar el libro',
        }
    }
}

const eliminarLibroSchema = z.object({
    libroId: z.string().min(1, 'El ID del libro es requerido'),
})

/**
 * Eliminar un libro
 * 
 * - Verifica que no tenga préstamos activos
 * - Solo usuarios autenticados pueden eliminar
 * - Registra en auditoría
 */
export async function eliminarLibro(
    data: { libroId: string }
): Promise<ServerActionResponse<void>> {
    try {
        // 1. Verificar autenticación
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return {
                success: false,
                error: 'No autorizado. Debes iniciar sesión.',
            }
        }

        // 2. Validar datos
        const validacion = eliminarLibroSchema.safeParse(data)

        if (!validacion.success) {
            return {
                success: false,
                error: 'Datos inválidos',
                errors: validacion.error.flatten().fieldErrors,
            }
        }

        const { libroId } = validacion.data

        // 3. Verificar que el libro existe
        const libro = await prisma.libro.findUnique({
            where: { id: libroId },
            include: {
                prestamos: {
                    where: {
                        fechaDevolucion: null, // Préstamos activos
                    },
                },
            },
        })

        if (!libro) {
            return {
                success: false,
                error: 'Libro no encontrado',
            }
        }

        // 4. Verificar que no tenga préstamos activos
        if (libro.prestamos.length > 0) {
            return {
                success: false,
                error: `No se puede eliminar. El libro tiene ${libro.prestamos.length} préstamo(s) activo(s).`,
            }
        }

        // 5. Eliminar libro y registrar auditoría
        await prisma.$transaction([
            // Eliminar libro
            prisma.libro.delete({
                where: { id: libroId },
            }),
            // Registrar en auditoría
            prisma.auditLog.create({
                data: {
                    usuarioId: session.user.id,
                    action: 'ELIMINAR',
                    entity: 'Libro',
                    detalles: `Eliminó libro: ${libro.titulo} (N° ${libro.numero})`,
                },
            }),
        ])

        // 6. Revalidar rutas
        revalidatePath('/dashboard/inventario')

        return {
            success: true,
        }
    } catch (error: any) {
        console.error('Error al eliminar libro:', error)
        return {
            success: false,
            error: error.message || 'Error inesperado al eliminar el libro',
        }
    }
}

/**
 * Obtener todos los libros con búsqueda opcional
 * Helper para Server Components
 */
export async function obtenerLibros(busqueda?: string): Promise<Libro[]> {
    const whereClause: any = {}

    if (busqueda) {
        whereClause.OR = [
            { titulo: { contains: busqueda } },
            { autor: { contains: busqueda } },
            { numeroRegistro: { contains: busqueda } },
        ]
    }

    const libros = await prisma.libro.findMany({
        where: whereClause,
        orderBy: { numero: 'asc' },
    })

    return libros
}

/**
 * Obtener un libro por ID
 * Helper para Server Components
 */
export async function obtenerLibroPorId(id: string): Promise<Libro | null> {
    const libro = await prisma.libro.findUnique({
        where: { id },
    })

    return libro
}

/**
 * Obtener libros para exportar a Excel
 * 
 * - Devuelve datos planos y formateados
 */
export async function obtenerLibrosParaExportar(busqueda?: string) {
    const whereClause: any = {}

    if (busqueda) {
        whereClause.OR = [
            { titulo: { contains: busqueda } },
            { autor: { contains: busqueda } },
            { numeroRegistro: { contains: busqueda } },
            { sigTop: { contains: busqueda } },
        ]
    }

    const libros = await prisma.libro.findMany({
        where: whereClause,
        orderBy: { numero: 'asc' },
    })

    // Formatear para Excel
    return libros.map(libro => ({
        'SIG. TOP': libro.sigTop || '',
        'Código': libro.numeroRegistro || '',
        'Autor': libro.autor || '',
        'Título': libro.titulo,
        'Edición': libro.edicion || '',
        'Cantidad': libro.cantidad,
        'Disponibles': libro.disponible,
        'Fecha Registro': libro.fechaRegistro ? libro.fechaRegistro.toLocaleDateString('es-ES') : '',
    }))
}

/**
 * Importar libros desde CSV
 * 
 * - Lee el archivo subido y crea los libros en la BD
 */
export async function importarLibrosCSV(formData: FormData): Promise<ServerActionResponse<{ importados: number }>> {
    try {
        // 1. Verificar autenticación
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return {
                success: false,
                error: 'No autorizado. Debes iniciar sesión.',
            }
        }

        // 2. Obtener archivo
        const file = formData.get('file') as File
        if (!file) {
            return {
                success: false,
                error: 'No se ha proporcionado ningún archivo',
            }
        }

        const csvContent = await file.text()

        // 3. Parsear CSV (saltando header)
        const lines = csvContent.split('\n').slice(1) // Saltar header
        let importados = 0
        let numeroConsecutivo = 1

        // Obtener el último número para continuar la secuencia
        const ultimoLibro = await prisma.libro.findFirst({
            orderBy: { numero: 'desc' },
            select: { numero: true },
        })

        if (ultimoLibro?.numero) {
            numeroConsecutivo = ultimoLibro.numero + 1
        }

        // 4. Procesar cada línea
        for (const line of lines) {
            if (!line.trim()) continue // Saltar líneas vacías

            // Parser CSV robusto que maneja comillas escapadas
            const valores: string[] = []
            let current = ''
            let inQuotes = false

            for (let i = 0; i < line.length; i++) {
                const char = line[i]
                const nextChar = line[i + 1]

                if (char === '"' && !inQuotes) {
                    inQuotes = true
                } else if (char === '"' && inQuotes) {
                    if (nextChar === '"') {
                        // Comilla doble escapada
                        current += '"'
                        i++ // Saltar la siguiente comilla
                    } else {
                        inQuotes = false
                    }
                } else if (char === ',' && !inQuotes) {
                    valores.push(current.trim())
                    current = ''
                } else {
                    current += char
                }
            }
            valores.push(current.trim()) // Agregar el último valor

            if (valores.length < 4) continue // Saltar líneas inválidas

            const sigTop = valores[0] || null
            const codigo = valores[1] || null
            const autor = valores[2] || null
            const titulo = valores[3] || 'Sin título'
            const edicion = valores[4] || null
            const cantidad = parseInt(valores[5]) || 1

            // console.log(`Importando: SIG.TOP="${sigTop}", Código="${codigo}", Título="${titulo}"`)

            try {
                await prisma.libro.create({
                    data: {
                        numero: numeroConsecutivo++,
                        sigTop,
                        numeroRegistro: codigo,
                        autor,
                        titulo,
                        edicion,
                        cantidad,
                        disponible: cantidad,
                        fechaRegistro: null,
                    },
                })

                importados++
            } catch (error) {
                console.error(`Error al importar libro: ${titulo}`, error)
                // Continuar con el siguiente
            }
        }

        // 5. Revalidar
        revalidatePath('/dashboard/inventario')

        return {
            success: true,
            data: { importados },
        }
    } catch (error: any) {
        console.error('Error al importar CSV:', error)
        return {
            success: false,
            error: error.message || 'Error inesperado al importar el CSV',
        }
    }
}
