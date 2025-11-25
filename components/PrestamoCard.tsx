'use client'

import { Prisma } from '@prisma/client'
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

  const formatearFecha = (fecha: Date) => {
    return new Date(fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const fechaLimite = new Date(prestamo.fechaLimite)
  const hoy = new Date()
  const estaVencido = fechaLimite < hoy && prestamo.estado === 'ACTIVO'

  const getEstadoBadge = () => {
    if (prestamo.estado === 'DEVUELTO') return 'bg-emerald-100 text-emerald-700'
    if (estaVencido) return 'bg-rose-100 text-rose-700'
    return 'bg-amber-100 text-amber-700'
  }

  const getEstadoTexto = () => {
    if (prestamo.estado === 'DEVUELTO') return 'DEVUELTO'
    if (estaVencido) return 'VENCIDO'
    return 'ACTIVO'
  }

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{prestamo.libro.titulo}</h3>
          {prestamo.libro.autor && (
            <p className="text-sm text-gray-600 mt-0.5">por {prestamo.libro.autor}</p>
          )}
        </div>
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getEstadoBadge()}`}>
          {getEstadoTexto()}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-100">
        <div>
          <p className="text-xs text-gray-500">Prestatario</p>
          <p className="text-sm font-medium text-gray-900 mt-0.5">{prestamo.nombrePrestatario}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">DNI</p>
          <p className="text-sm font-medium text-gray-900 mt-0.5">{prestamo.dni}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Fecha Préstamo</p>
          <p className="text-sm font-medium text-gray-900 mt-0.5">{formatearFecha(prestamo.fechaPrestamo)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Fecha Límite</p>
          <p className={`text-sm font-medium mt-0.5 ${estaVencido ? 'text-rose-600' : 'text-gray-900'}`}>
            {formatearFecha(fechaLimite)}
          </p>
        </div>
        {prestamo.fechaDevolucion && (
          <>
            <div>
              <p className="text-xs text-gray-500">Devolución</p>
              <p className="text-sm font-medium text-gray-900 mt-0.5">{formatearFecha(prestamo.fechaDevolucion)}</p>
            </div>
          </>
        )}
      </div>

      {prestamo.observaciones && (
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-1">Observaciones</p>
          <p className="text-sm text-gray-700">{prestamo.observaciones}</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">
          Operador: <span className="font-medium text-gray-700">{prestamo.operador.name}</span>
        </p>
        {prestamo.estado === 'ACTIVO' && (
          <button
            onClick={handleDevolver}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Procesando...' : 'Marcar Devuelto'}
          </button>
        )}
      </div>
    </div>
  )
}
