/**
 * COMPONENTE: FORMULARIO EDITAR LIBRO (Client Component)
 * 
 * ✅ Usa Server Actions
 * ✅ Toasts profesionales
 * ✅ Colores semánticos
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { actualizarLibro } from '@/lib/actions/libros'
import { toast } from '@/lib/toast'
import { type Libro } from '@/types'

interface FormularioEditarLibroProps {
    libro: Libro
}

export default function FormularioEditarLibro({ libro }: FormularioEditarLibroProps) {
    const router = useRouter()
    const [enviando, setEnviando] = useState(false)

    // Formatear fecha para input
    const fechaFormateada = libro.fechaRegistro
        ? new Date(libro.fechaRegistro).toISOString().split('T')[0]
        : ''

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setEnviando(true)

        try {
            const formData = new FormData(e.currentTarget)
            formData.append('id', libro.id)

            const resultado = await actualizarLibro(formData)

            if (resultado.success) {
                toast.success('Libro actualizado', `Se han guardado los cambios en "${resultado.data?.titulo}"`)
                router.push('/dashboard/inventario')
            } else {
                toast.error(resultado.error || 'Error al actualizar libro')

                if (resultado.errors) {
                    Object.entries(resultado.errors).forEach(([field, messages]) => {
                        messages.forEach((msg) => toast.error(`${field}: ${msg}`))
                    })
                }
            }
        } catch (error: any) {
            console.error('Error:', error)
            toast.error('Error inesperado al actualizar el libro')
        } finally {
            setEnviando(false)
        }
    }

    return (
        <>
            {/* Header */}
            <div>
                <Link
                    href="/dashboard/inventario"
                    className="text-brand-600 hover:text-brand-700 inline-flex items-center gap-2 mb-3 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Volver al inventario
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Editar Libro</h1>
                <p className="text-gray-600 mt-1">Actualice la información del libro</p>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="card space-y-6">
                {/* Warning sobre cantidad */}
                <div className="bg-warning-50 border border-warning-200 px-4 py-3 rounded-lg">
                    <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-warning-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <div>
                            <p className="text-sm font-medium text-warning-900">Advertencia</p>
                            <p className="text-xs text-warning-700 mt-1">
                                Al cambiar la cantidad total, la disponibilidad se ajustará automáticamente de forma proporcional.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Título */}
                <div className="input-group">
                    <label htmlFor="titulo" className="input-label">
                        Título <span className="text-danger-500">*</span>
                    </label>
                    <input
                        id="titulo"
                        name="titulo"
                        type="text"
                        required
                        defaultValue={libro.titulo}
                        placeholder="Ingrese el título del libro"
                        disabled={enviando}
                    />
                </div>

                {/* Autor */}
                <div className="input-group">
                    <label htmlFor="autor" className="input-label">
                        Autor <span className="text-gray-400 text-xs">(Opcional)</span>
                    </label>
                    <input
                        id="autor"
                        name="autor"
                        type="text"
                        defaultValue={libro.autor || ''}
                        placeholder="Ingrese el nombre del autor"
                        disabled={enviando}
                    />
                </div>

                {/* Grid de 2 columnas */}
                <div className="grid grid-cols-2 gap-6">
                    <div className="input-group">
                        <label htmlFor="fechaRegistro" className="input-label">
                            Fecha de Registro <span className="text-gray-400 text-xs">(Opcional)</span>
                        </label>
                        <input
                            id="fechaRegistro"
                            name="fechaRegistro"
                            type="date"
                            defaultValue={fechaFormateada}
                            disabled={enviando}
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="numeroRegistro" className="input-label">
                            N° de Registro <span className="text-gray-400 text-xs">(Opcional)</span>
                        </label>
                        <input
                            id="numeroRegistro"
                            name="numeroRegistro"
                            type="text"
                            defaultValue={libro.numeroRegistro || ''}
                            placeholder="Ej: REG-2024-001"
                            disabled={enviando}
                        />
                    </div>
                </div>

                {/* Cantidad */}
                <div className="input-group">
                    <label htmlFor="cantidad" className="input-label">
                        Cantidad de Ejemplares <span className="text-danger-500">*</span>
                    </label>
                    <input
                        id="cantidad"
                        name="cantidad"
                        type="number"
                        required
                        min="1"
                        defaultValue={libro.cantidad}
                        disabled={enviando}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                        Actualmente hay {libro.disponible} de {libro.cantidad} ejemplares disponibles
                    </p>
                </div>

                {/* Botones */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                        type="submit"
                        disabled={enviando}
                        className="btn-primary flex-1"
                    >
                        {enviando ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Guardando...
                            </span>
                        ) : (
                            'Guardar Cambios'
                        )}
                    </button>
                    <Link href="/dashboard/inventario" className="btn-secondary flex-1 text-center">
                        Cancelar
                    </Link>
                </div>
            </form>
        </>
    )
}
