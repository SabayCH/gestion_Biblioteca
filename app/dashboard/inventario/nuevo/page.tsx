'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NuevoLibroPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    titulo: '',
    autor: '',
    fechaRegistro: '',
    numeroRegistro: '',
    cantidad: '1',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/libros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: formData.titulo,
          autor: formData.autor || null,
          fechaRegistro: formData.fechaRegistro || null,
          numeroRegistro: formData.numeroRegistro || null,
          cantidad: parseInt(formData.cantidad),
          disponible: parseInt(formData.cantidad),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al crear el libro')
      }

      router.push('/dashboard/inventario')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/dashboard/inventario" className="text-sm text-purple-600 hover:text-purple-700 flex items-center mb-3">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver al inventario
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Agregar Nuevo Libro</h1>
        <p className="text-gray-600 mt-1">Complete la información del libro</p>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="card space-y-6">
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Información Note */}
        <div className="bg-purple-50 border border-purple-200 px-4 py-3 rounded-lg">
          <p className="text-sm text-purple-700">
            <strong>Nota:</strong> Solo el título y la cantidad son obligatorios. Los demás campos son opcionales.
          </p>
        </div>

        {/* Título */}
        <div className="input-group">
          <label htmlFor="titulo" className="input-label">
            Título <span className="text-rose-500">*</span>
          </label>
          <input
            id="titulo"
            type="text"
            required
            placeholder="Ingrese el título del libro"
            value={formData.titulo}
            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
          />
        </div>

        {/* Autor */}
        <div className="input-group">
          <label htmlFor="autor" className="input-label">
            Autor <span className="text-gray-400 text-xs">(Opcional)</span>
          </label>
          <input
            id="autor"
            type="text"
            placeholder="Ingrese el nombre del autor"
            value={formData.autor}
            onChange={(e) => setFormData({ ...formData, autor: e.target.value })}
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
              type="date"
              value={formData.fechaRegistro}
              onChange={(e) => setFormData({ ...formData, fechaRegistro: e.target.value })}
            />
          </div>

          <div className="input-group">
            <label htmlFor="numeroRegistro" className="input-label">
              N° de Registro <span className="text-gray-400 text-xs">(Opcional)</span>
            </label>
            <input
              id="numeroRegistro"
              type="text"
              placeholder="Ej: REG-2024-001"
              value={formData.numeroRegistro}
              onChange={(e) => setFormData({ ...formData, numeroRegistro: e.target.value })}
            />
          </div>
        </div>

        {/* Cantidad */}
        <div className="input-group">
          <label htmlFor="cantidad" className="input-label">
            Cantidad de Ejemplares <span className="text-rose-500">*</span>
          </label>
          <input
            id="cantidad"
            type="number"
            required
            min="1"
            value={formData.cantidad}
            onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
          />
          <p className="text-sm text-gray-500 mt-1">
            Todos los ejemplares estarán disponibles inicialmente
          </p>
        </div>

        {/* Botones */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex-1"
          >
            {loading ? 'Guardando...' : 'Guardar Libro'}
          </button>
          <Link href="/dashboard/inventario" className="btn-secondary flex-1 text-center">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
