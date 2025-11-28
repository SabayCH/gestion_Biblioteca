'use client'

import { useState } from 'react'
import { devolverPrestamo } from '@/lib/actions/prestamos'
import { toast, confirmToast } from '@/lib/toast'
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
    // 1. Confirmación bonita en lugar de window.confirm
    const confirmado = await confirmToast({
      title: '¿Confirmar devolución?',
      description: `Se marcará como devuelto el libro "${prestamo.libro.titulo}" prestado a ${prestamo.nombrePrestatario}.`,
      confirmText: 'Sí, devolver',
    })

    if (!confirmado) return

    setLoading(true)
    try {
      // 2. Llamada directa a la Server Action
      const resultado = await devolverPrestamo({ prestamoId: prestamo.id })

      if (resultado.success) {
        toast.success('Libro devuelto correctamente')
        // La UI se actualiza sola gracias a revalidatePath en la acción
      } else {
        toast.error(resultado.error || 'Error al procesar la devolución')
      }
    } catch (error) {
      toast.error('Error inesperado')
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
    if (prestamo.estado === 'DEVUELTO') return 'bg-success-100 text-success-700'
    if (estaVencido) return 'bg-danger-100 text-danger-700'
    return 'bg-warning-100 text-warning-700'
  }

  const getEstadoTexto = () => {
    if (prestamo.estado === 'DEVUELTO') return 'DEVUELTO'
    if (estaVencido) return 'VENCIDO'
    return 'ACTIVO'
  }

  return (
    <div className="card group hover:border-brand-200/50">
      <div className="flex items-start justify-between mb-5">
        <div className="flex-1 pr-4">
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-brand-700 transition-colors">
            {prestamo.libro.titulo}
          </h3>
          {prestamo.libro.autor && (
            <p className="text-sm text-gray-500 mt-1 font-medium">
              {prestamo.libro.autor}
            </p>
          )}
        </div>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase shadow-sm ${getEstadoBadge()}`}>
          {getEstadoTexto()}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-y-4 gap-x-6 mb-5 pb-5 border-b border-gray-50">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Prestatario</p>
          <p className="text-sm font-medium text-gray-900">{prestamo.nombrePrestatario}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">DNI</p>
          <p className="text-sm font-medium text-gray-900 font-mono text-gray-600">{prestamo.dni}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Fecha Préstamo</p>
          <p className="text-sm font-medium text-gray-900">{formatearFecha(prestamo.fechaPrestamo)}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Fecha Límite</p>
          <p className={`text-sm font-bold ${estaVencido ? 'text-danger-600' : 'text-gray-900'}`}>
            {formatearFecha(fechaLimite)}
          </p>
        </div>
        {prestamo.fechaDevolucion && (
          <div className="col-span-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Devolución</p>
            <p className="text-sm font-medium text-success-700">{formatearFecha(prestamo.fechaDevolucion)}</p>
          </div>
        )}
      </div>

      {prestamo.observaciones && (
        <div className="mb-5 bg-gray-50 rounded-lg p-3 border border-gray-100">
          <p className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Observaciones
          </p>
          <p className="text-sm text-gray-600 italic">{prestamo.observaciones}</p>
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center text-xs font-bold text-brand-700">
            {prestamo.operador.name?.charAt(0).toUpperCase()}
          </div>
          <p className="text-xs text-gray-500 font-medium">
            {prestamo.operador.name}
          </p>
        </div>

        {prestamo.estado === 'ACTIVO' && (
          <button
            onClick={handleDevolver}
            disabled={loading}
            className="btn-primary py-2 px-4 text-sm shadow-brand-500/20"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Procesando...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Marcar Devuelto
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
