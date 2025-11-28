'use client'

import { useState } from 'react'
import { devolverPrestamo } from '@/lib/actions/prestamos'
import { toast, confirmToast } from '@/lib/toast'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { type Prestamo, type Libro, type User } from '@prisma/client'

// Definir el tipo con relaciones
type PrestamoConRelaciones = Prestamo & {
  libro: Libro
  operador: User
}

interface PrestamoCardProps {
  prestamo: PrestamoConRelaciones
}

export default function PrestamoCard({ prestamo }: PrestamoCardProps) {
  const [loading, setLoading] = useState(false)

  const handleDevolver = async () => {
    // 1. Confirmación moderna
    const confirmado = await confirmToast({
      title: '¿Devolver libro?',
      description: `Confirmar devolución de "${prestamo.libro.titulo}"`,
      confirmText: 'Sí, devolver',
    })

    if (!confirmado) return

    setLoading(true)
    try {
      // 2. Llamada a Server Action
      // Ajuste: La acción espera un FormData o un objeto, pero mi implementación actual
      // en lib/actions/prestamos.ts espera un objeto con { prestamoId: string } si se llama directamente.
      // El código del usuario sugería devolverPrestamo(prestamo.id), pero eso pasaría un string.
      // Lo corregimos para pasar el objeto esperado.
      const res = await devolverPrestamo({ prestamoId: prestamo.id })

      if (res.success) {
        toast.success('Libro devuelto correctamente')
      } else {
        toast.error(res.error || 'Error al devolver')
      }
    } catch {
      toast.error('Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  const formatearFecha = (fecha: Date) => {
    return format(new Date(fecha), "dd 'de' MMM, yyyy", { locale: es })
  }

  const fechaLimite = new Date(prestamo.fechaLimite)
  const hoy = new Date()
  const estaVencido = fechaLimite < hoy && prestamo.estado === 'ACTIVO'

  const getEstadoBadge = () => {
    if (prestamo.estado === 'DEVUELTO') return 'bg-emerald-100 text-emerald-700'
    if (estaVencido) return 'bg-rose-100 text-rose-700'
    return 'bg-amber-100 text-amber-700'
  }

  return (
    <div className="card bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{prestamo.libro.titulo}</h3>
          {prestamo.libro.autor && (
            <p className="text-sm text-gray-600 mt-0.5">por {prestamo.libro.autor}</p>
          )}
        </div>
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getEstadoBadge()}`}>
          {prestamo.estado === 'DEVUELTO' ? 'DEVUELTO' : estaVencido ? 'VENCIDO' : 'ACTIVO'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-100">
        <div>
          <p className="text-xs text-gray-500">Prestatario</p>
          <p className="text-sm font-medium text-gray-900 mt-0.5">{prestamo.nombrePrestatario}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Fecha Límite</p>
          <p className={`text-sm font-medium mt-0.5 ${estaVencido ? 'text-rose-600' : 'text-gray-900'}`}>
            {formatearFecha(fechaLimite)}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">
          DNI: {prestamo.dni}
        </p>
        {prestamo.estado === 'ACTIVO' && (
          <button
            onClick={handleDevolver}
            disabled={loading}
            className="btn-primary text-sm px-3 py-1.5"
          >
            {loading ? '...' : 'Marcar Devuelto'}
          </button>
        )}
      </div>
    </div>
  )
}
