'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

interface Libro {
  id: string
  numero: number
  fechaRegistro: string | null
  numeroRegistro: string | null
  titulo: string
  autor: string | null
  cantidad: number
  disponible: number
}

export default function InventarioPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [libros, setLibros] = useState<Libro[]>([])
  const [loading, setLoading] = useState(true)
  const [busquedaGeneral, setBusquedaGeneral] = useState(searchParams.get('q') || '')

  useEffect(() => {
    fetchLibros()
  }, [searchParams])

  const fetchLibros = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchParams.get('q')) params.set('q', searchParams.get('q')!)

      const response = await fetch(`/api/libros?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setLibros(data)
      }
    } catch (error) {
      console.error('Error al cargar libros:', error)
    } finally {
      setLoading(false)
    }
  }

  const aplicarBusqueda = () => {
    const params = new URLSearchParams()
    if (busquedaGeneral) params.set('q', busquedaGeneral)
    router.push(`/dashboard/inventario?${params.toString()}`)
  }

  const limpiarBusqueda = () => {
    setBusquedaGeneral('')
    router.push('/dashboard/inventario')
  }

  const formatearFecha = (fecha: string | null) => {
    if (!fecha) return '-'
    return new Date(fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventario</h1>
          <p className="text-gray-600 mt-1">Gestión de libros y existencias</p>
        </div>
        <Link href="/dashboard/inventario/nuevo" className="btn-primary">
          + Agregar Libro
        </Link>
      </div>

      {/* Búsqueda */}
      <div className="card">
        <div className="flex gap-3">
          <input
            type="text"
            value={busquedaGeneral}
            onChange={(e) => setBusquedaGeneral(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && aplicarBusqueda()}
            placeholder="Buscar por título, autor o número de registro..."
            className="flex-1"
          />
          <button onClick={aplicarBusqueda} className="btn-primary">
            Buscar
          </button>
          {busquedaGeneral && (
            <button onClick={limpiarBusqueda} className="btn-secondary">
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="card text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando libros...</p>
        </div>
      ) : libros.length === 0 ? (
        <div className="card text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <p className="text-gray-500 mb-3">
            {searchParams.get('q') ? 'No se encontraron libros' : 'No hay libros registrados'}
          </p>
          {!searchParams.get('q') && (
            <Link href="/dashboard/inventario/nuevo" className="btn-primary inline-block">
              Agregar Primer Libro
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N°</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Autor</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Reg.</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Disponibles</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {libros.map((libro) => (
                    <tr key={libro.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{libro.numero}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{libro.titulo}</p>
                          {libro.numeroRegistro && (
                            <p className="text-xs text-gray-500">Reg: {libro.numeroRegistro}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-600">{libro.autor || '-'}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">{formatearFecha(libro.fechaRegistro)}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${libro.disponible > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                          }`}>
                          {libro.disponible} / {libro.cantidad}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                        <Link href={`/dashboard/inventario/${libro.id}/editar`} className="text-purple-600 hover:text-purple-700">
                          Editar
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer con contador */}
          <div className="flex justify-between items-center text-sm text-gray-600">
            <p>
              Mostrando <span className="font-medium text-gray-900">{libros.length}</span> libro(s)
            </p>
          </div>
        </>
      )}
    </div>
  )
}
