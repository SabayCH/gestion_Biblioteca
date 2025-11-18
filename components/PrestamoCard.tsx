'use client'

import { Prisma } from '@prisma/client'
import { format } from 'date-fns'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type PrestamoWithRelations = Prisma.PrestamoGetPayload<{
  include: { libro: true; operador: true }
}>

interface PrestamoCardProps {
  prestamo: PrestamoWithRelations
}

export default function PrestamoCard({ prestamo }: PrestamoCardProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDevolver = async () => {
    if (!confirm('¿Marcar este préstamo como devuelto?')) return

    setLoading(true)
    try {
      const response = await fetch(`/api/prestamos/${prestamo.id}/devolver`, {
        method: 'PUT',
      })

      if (response.ok) {
        router.refresh()
      } else {
        alert('Error al devolver el préstamo')
      }
    } catch (error) {
      alert('Error al devolver el préstamo')
    } finally {
      setLoading(false)
    }
  }

  const fechaLimite = new Date(prestamo.fechaLimite)
  const hoy = new Date()
  const estaVencido = fechaLimite < hoy && prestamo.estado === 'ACTIVO'

  return (
    <div
      className={`bg-white rounded-lg shadow p-6 ${
        prestamo.estado === 'ACTIVO' && estaVencido ? 'border-l-4 border-red-500' : ''
      } ${
        prestamo.estado === 'DEVUELTO'
          ? 'bg-gray-50 border-l-4 border-green-500'
          : ''
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-1">
            {prestamo.libro.titulo}
          </h3>
          <p className="text-gray-600 text-sm">por {prestamo.libro.autor}</p>
          <p className="text-gray-500 text-xs mt-1">
            Prestatario: <span className="font-medium">{prestamo.nombrePrestatario}</span>
          </p>
          <p className="text-gray-500 text-xs">
            DNI: <span className="font-medium">{prestamo.dni}</span>
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Registrado por: <span className="font-medium">{prestamo.operador.name}</span>
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            prestamo.estado === 'ACTIVO'
              ? estaVencido
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
              : 'bg-green-100 text-green-800'
          }`}
        >
          {prestamo.estado === 'ACTIVO' && estaVencido
            ? 'VENCIDO'
            : prestamo.estado}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500 mb-1">Fecha de Préstamo</p>
          <p className="text-sm font-medium text-gray-900">
            {format(new Date(prestamo.fechaPrestamo), 'dd/MM/yyyy')}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Fecha Límite</p>
          <p
            className={`text-sm font-medium ${
              estaVencido ? 'text-red-600' : 'text-gray-900'
            }`}
          >
            {format(fechaLimite, 'dd/MM/yyyy')}
          </p>
        </div>
        {prestamo.fechaDevolucion && (
          <div>
            <p className="text-xs text-gray-500 mb-1">Fecha de Devolución</p>
            <p className="text-sm font-medium text-gray-900">
              {format(new Date(prestamo.fechaDevolucion), 'dd/MM/yyyy')}
            </p>
          </div>
        )}
        {prestamo.libro.isbn && (
          <div>
            <p className="text-xs text-gray-500 mb-1">ISBN</p>
            <p className="text-sm font-medium text-gray-900">
              {prestamo.libro.isbn}
            </p>
          </div>
        )}
      </div>

      {prestamo.observaciones && (
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-1">Observaciones</p>
          <p className="text-sm text-gray-700">{prestamo.observaciones}</p>
        </div>
      )}

      {prestamo.estado === 'ACTIVO' && (
        <button
          onClick={handleDevolver}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {loading ? 'Procesando...' : 'Marcar como Devuelto'}
        </button>
      )}
    </div>
  )
}

