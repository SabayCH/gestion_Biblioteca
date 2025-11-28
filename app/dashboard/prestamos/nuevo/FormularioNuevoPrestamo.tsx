/**
 * COMPONENTE: FORMULARIO NUEVO PRÉSTAMO (Client Component)
 * 
 * ✅ Usa Server Actions
 * ✅ Toasts profesionales
 * ✅ Colores semánticos
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { format, addDays } from 'date-fns'
import { crearPrestamo } from '@/lib/actions/prestamos'
import { toast } from '@/lib/toast'
import { type Libro } from '@/types'
import LibroCombobox from '@/components/LibroCombobox'

interface FormularioNuevoPrestamoProps {
    libros: Libro[]
}

export default function FormularioNuevoPrestamo({ libros }: FormularioNuevoPrestamoProps) {
    const router = useRouter()
    const [enviando, setEnviando] = useState(false)

    const handleSubmit = async (formData: FormData) => {
        setEnviando(true)

        try {
            const resultado = await crearPrestamo(formData)

            if (resultado.success) {
                toast.success('Préstamo creado exitosamente', 'El libro ha sido prestado correctamente')
                router.push('/dashboard/prestamos')
            } else {
                toast.error(resultado.error || 'Error al crear préstamo')

                if (resultado.errors) {
                    Object.entries(resultado.errors).forEach(([field, messages]) => {
                        messages.forEach((msg) => toast.error(`${field}: ${msg}`))
                    })
                }
            }
        } catch (error: any) {
            console.error('Error:', error)
            toast.error('Error inesperado al crear el préstamo')
        } finally {
            setEnviando(false)
        }
    }

    return (
        <>
            {/* Header */}
            <div className="mb-8">
                <Link
                    href="/dashboard/prestamos"
                    className="text-brand-600 hover:text-brand-700 inline-flex items-center gap-2 mb-4 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Volver a préstamos
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">Nuevo Préstamo</h1>
                <p className="text-gray-600 mt-1">Registre un nuevo préstamo de libro</p>
            </div>

            {/* Formulario */}
            <form action={handleSubmit} className="card space-y-6">
                {/* Info de libros disponibles */}
                {libros.length === 0 ? (
                    <div className="bg-warning-50 border border-warning-200 px-4 py-3 rounded-lg">
                        <div className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-warning-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <div>
                                <p className="text-sm font-medium text-warning-900">No hay libros disponibles</p>
                                <p className="text-xs text-warning-700 mt-1">
                                    Actualmente no hay libros disponibles para préstamo.
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-info-50 border border-info-200 px-4 py-3 rounded-lg">
                        <div className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-info-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <div>
                                <p className="text-sm font-medium text-info-900">Información</p>
                                <p className="text-xs text-info-700 mt-1">
                                    Hay {libros.length} libro(s) disponible(s) para préstamo. El sistema validará
                                    automáticamente si el prestatario tiene préstamos pendientes.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Libro */}
                <div className="input-group">
                    <label htmlFor="libroId" className="input-label">
                        Libro <span className="text-danger-500">*</span>
                    </label>
                    <LibroCombobox
                        libros={libros}
                        name="libroId"
                        disabled={enviando || libros.length === 0}
                        required
                    />
                </div>

                {/* Nombre */}
                <div className="input-group">
                    <label htmlFor="nombrePrestatario" className="input-label">
                        Nombre del Prestatario <span className="text-danger-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="nombrePrestatario"
                        name="nombrePrestatario"
                        required
                        placeholder="Ej: Juan Pérez"
                        disabled={enviando}
                    />
                </div>

                {/* DNI */}
                <div className="input-group">
                    <label htmlFor="dni" className="input-label">
                        DNI <span className="text-danger-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="dni"
                        name="dni"
                        required
                        placeholder="Ej: 12345678"
                        disabled={enviando}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        El sistema validará si hay préstamos pendientes con este DNI
                    </p>
                </div>

                {/* Email */}
                <div className="input-group">
                    <label htmlFor="email" className="input-label">
                        Email del Prestatario <span className="text-gray-400 text-xs">(Opcional)</span>
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="Ej: juan.perez@email.com"
                        disabled={enviando}
                    />
                </div>

                {/* Fecha Límite */}
                <div className="input-group">
                    <label htmlFor="fechaLimite" className="input-label">
                        Fecha Límite de Devolución <span className="text-danger-500">*</span>
                    </label>
                    <input
                        type="date"
                        id="fechaLimite"
                        name="fechaLimite"
                        required
                        defaultValue={format(addDays(new Date(), 15), 'yyyy-MM-dd')}
                        min={format(new Date(), 'yyyy-MM-dd')}
                        disabled={enviando}
                    />
                    <p className="text-xs text-gray-500 mt-1">Por defecto: 15 días desde hoy</p>
                </div>

                {/* Observaciones */}
                <div className="input-group">
                    <label htmlFor="observaciones" className="input-label">
                        Observaciones <span className="text-gray-400 text-xs">(Opcional)</span>
                    </label>
                    <textarea
                        id="observaciones"
                        name="observaciones"
                        rows={4}
                        placeholder="Información adicional sobre el préstamo..."
                        disabled={enviando}
                    />
                </div>

                {/* Botones */}
                <div className="flex gap-4 pt-4 border-t border-gray-200">
                    <button
                        type="submit"
                        disabled={enviando || libros.length === 0}
                        className="btn-primary flex-1"
                    >
                        {enviando ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Creando...
                            </span>
                        ) : (
                            'Crear Préstamo'
                        )}
                    </button>
                    <Link href="/dashboard/prestamos" className="btn-secondary flex-1 text-center">
                        Cancelar
                    </Link>
                </div>
            </form>
        </>
    )
}
