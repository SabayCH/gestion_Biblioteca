/**
 * PÁGINA: CREAR NUEVO LIBRO
 * 
 * ✅ Usa Server Actions
 * ✅ Toasts con Sonner
 * ✅ Colores semánticos
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { crearLibro } from '@/lib/actions/libros'
import { toast } from '@/lib/toast'

export default function NuevoLibroPage() {
  const router = useRouter()
  const [enviando, setEnviando] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setEnviando(true)

    try {
      const formData = new FormData(e.currentTarget)
      const resultado = await crearLibro(formData)

      if (resultado.success) {
        toast.success('Libro creado exitosamente', `Se ha agregado "${resultado.data?.titulo}" al inventario`)
        router.push('/dashboard/inventario')
      } else {
        toast.error(resultado.error || 'Error al crear libro')

        if (resultado.errors) {
          Object.entries(resultado.errors).forEach(([field, messages]) => {
            messages.forEach((msg) => toast.error(`${field}: ${msg}`))
          })
        }
      }
    } catch (error: any) {
      console.error('Error:', error)
      toast.error('Error inesperado al crear el libro')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="space-y-6">
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
        <h1 className="text-2xl font-bold text-gray-900">Agregar Nuevo Libro</h1>
        <p className="text-gray-600 mt-1">Complete la información del libro</p>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="card space-y-6">
        {/* Información Note */}
        <div className="bg-info-50 border border-info-200 px-4 py-3 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-info-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-medium text-info-900">Información</p>
              <p className="text-xs text-info-700 mt-1">
                Solo el título y la cantidad son obligatorios. Los demás campos son opcionales.
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
            placeholder="Ingrese el nombre del autor"
            disabled={enviando}
          />
        </div>

        {/* Grid de 2 columnas - SIG. TOP y Código */}
        <div className="grid grid-cols-2 gap-6">
          <div className="input-group">
            <label htmlFor="sigTop" className="input-label">
              SIG. TOP <span className="text-gray-400 text-xs">(Opcional)</span>
            </label>
            <input
              id="sigTop"
              name="sigTop"
              type="text"
              placeholder="Ej: R.036/96-ESEN"
              disabled={enviando}
            />
          </div>

          <div className="input-group">
            <label htmlFor="numeroRegistro" className="input-label">
              Código <span className="text-gray-400 text-xs">(Opcional)</span>
            </label>
            <input
              id="numeroRegistro"
              name="numeroRegistro"
              type="text"
              placeholder="Ej: ESEN-01-14"
              disabled={enviando}
            />
          </div>
        </div>

        {/* Grid de 2 columnas - Edición y Fecha */}
        <div className="grid grid-cols-2 gap-6">
          <div className="input-group">
            <label htmlFor="edicion" className="input-label">
              Edición <span className="text-gray-400 text-xs">(Opcional)</span>
            </label>
            <input
              id="edicion"
              name="edicion"
              type="text"
              placeholder="Ej: 1959, Primera edición"
              disabled={enviando}
            />
          </div>

          <div className="input-group">
            <label htmlFor="fechaRegistro" className="input-label">
              Fecha de Registro <span className="text-gray-400 text-xs">(Opcional)</span>
            </label>
            <input
              id="fechaRegistro"
              name="fechaRegistro"
              type="date"
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
            defaultValue="1"
            disabled={enviando}
          />
          <p className="text-sm text-gray-500 mt-1">
            Todos los ejemplares estarán disponibles inicialmente
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
              'Guardar Libro'
            )}
          </button>
          <Link href="/dashboard/inventario" className="btn-secondary flex-1 text-center">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
