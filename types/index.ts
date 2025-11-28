/**
 * TIPOS GLOBALES DEL SISTEMA - DERIVADOS DE PRISMA
 * 
 * Este archivo centraliza todos los tipos para evitar duplicación
 * y garantizar consistencia con el schema de la base de datos.
 */

import { Prisma } from '@prisma/client'

// ==================== TIPOS DE MODELOS BASE ====================

/**
 * Tipo completo de Usuario (extraído de Prisma)
 */
export type Usuario = Prisma.UserGetPayload<{}>

/**
 * Tipo completo de Libro (extraído de Prisma)
 */
export type Libro = Prisma.LibroGetPayload<{}>

/**
 * Tipo completo de Préstamo (extraído de Prisma)
 */
export type Prestamo = Prisma.PrestamoGetPayload<{}>

/**
 * Tipo completo de AuditLog (extraído de Prisma)
 */
export type AuditLog = Prisma.AuditLogGetPayload<{}>

// ==================== TIPOS CON RELACIONES ====================

/**
 * Préstamo con relaciones completas (libro + operador)
 */
export type PrestamoConRelaciones = Prisma.PrestamoGetPayload<{
    include: {
        libro: true
        operador: true
    }
}>

/**
 * Libro con relaciones de préstamos
 */
export type LibroConPrestamos = Prisma.LibroGetPayload<{
    include: {
        prestamos: true
    }
}>

/**
 * Usuario con relaciones de préstamos y auditoría
 */
export type UsuarioConRelaciones = Prisma.UserGetPayload<{
    include: {
        prestamosOperador: true
        auditLogs: true
    }
}>

// ==================== TIPOS PARA FORMULARIOS ====================

/**
 * Datos para crear un préstamo (sin ID ni timestamps)
 */
export type CrearPrestamoInput = {
    libroId: string
    nombrePrestatario: string
    dni: string
    email?: string | null
    fechaLimite: Date | string
    observaciones?: string | null
}

/**
 * Datos para crear un libro (sin ID ni timestamps)
 */
export type CrearLibroInput = {
    numero?: number | null
    fechaRegistro?: Date | string | null
    numeroRegistro?: string | null
    sigTop?: string | null
    titulo: string
    autor?: string | null
    edicion?: string | null
    cantidad?: number
    disponible?: number
}

/**
 * Datos para actualizar un libro
 */
export type ActualizarLibroInput = Partial<CrearLibroInput>

/**
 * Datos para crear un usuario
 */
export type CrearUsuarioInput = {
    email: string
    name: string
    password: string
    role?: string
}

// ==================== TIPOS DE ESTADO ====================

/**
 * Estados posibles de préstamo
 */
export type EstadoPrestamo = 'ACTIVO' | 'DEVUELTO' | 'VENCIDO'

/**
 * Roles de usuario
 */
export type RolUsuario = 'ADMIN' | 'USER'

/**
 * Acciones de auditoría
 */
export type AccionAudit = 'CREAR' | 'ACTUALIZAR' | 'ELIMINAR' | 'DEVOLVER'

// ==================== TIPOS DE RESPUESTA ====================

/**
 * Respuesta estándar de una acción del servidor
 */
export type ServerActionResponse<T = any> = {
    success: boolean
    data?: T
    error?: string
    errors?: Record<string, string[]> // Para errores de validación de Zod
}

/**
 * Tipo para parámetros de búsqueda
 */
export type SearchParams = {
    q?: string
    [key: string]: string | undefined
}
