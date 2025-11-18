'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { format, addDays } from 'date-fns'

export default function NuevoPrestamoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [libros, setLibros] = useState<any[]>([])
  const [formData, setFormData] = useState({
    libroId: '',
    nombrePrestatario: '',
    dni: '',
    email: '',
    fechaLimite: format(addDays(new Date(), 15), 'yyyy-MM-dd'),
    observaciones: '',
  })

  useEffect(() => {
    fetch('/api/libros')
      .then((res) => res.json())
      .then((data) => setLibros(data.filter((l: any) => l.disponible > 0)))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/prestamos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al crear el préstamo')
      }

      router.push('/dashboard/prestamos')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link
          href="/dashboard/prestamos"
          className="text-indigo-600 hover:text-indigo-700 mb-4 inline-block"
        >
          ← Volver a préstamos
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Nuevo Préstamo</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="libroId" className="block text-sm font-medium text-gray-700 mb-1">
            Libro *
          </label>
          <select
            id="libroId"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={formData.libroId}
            onChange={(e) => setFormData({ ...formData, libroId: e.target.value })}
          >
            <option value="">Seleccionar libro...</option>
            {libros.map((libro) => (
              <option key={libro.id} value={libro.id}>
                {libro.titulo} - {libro.autor} (Disponibles: {libro.disponible})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="nombrePrestatario" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del Prestatario *
          </label>
          <input
            type="text"
            id="nombrePrestatario"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Ej: Juan Pérez"
            value={formData.nombrePrestatario}
            onChange={(e) => setFormData({ ...formData, nombrePrestatario: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="dni" className="block text-sm font-medium text-gray-700 mb-1">
            DNI *
          </label>
          <input
            type="text"
            id="dni"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Ej: 12345678"
            value={formData.dni}
            onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
          />
          <p className="text-xs text-gray-500 mt-1">El sistema validará si hay préstamos pendientes con este DNI</p>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email del Prestatario (Opcional)
          </label>
          <input
            type="email"
            id="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Ej: juan.perez@email.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="fechaLimite" className="block text-sm font-medium text-gray-700 mb-1">
            Fecha Límite de Devolución *
          </label>
          <input
            type="date"
            id="fechaLimite"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={formData.fechaLimite}
            onChange={(e) => setFormData({ ...formData, fechaLimite: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="observaciones" className="block text-sm font-medium text-gray-700 mb-1">
            Observaciones
          </label>
          <textarea
            id="observaciones"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={formData.observaciones}
            onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creando...' : 'Crear Préstamo'}
          </button>
          <Link
            href="/dashboard/prestamos"
            className="flex-1 bg-gray-200 text-gray-700 text-center py-2 rounded-md hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}


