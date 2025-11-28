/**
 * PÁGINA DE INVENTARIO - SERVER COMPONENT
 * 
 * ✅ Componente async que hace fetch directo a la BD
 * ✅ No usa useEffect, useState ni fetch del cliente
 * ✅ Renderizado en el servidor con datos frescos
 * ✅ Búsqueda con searchParams
 */

import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { type SearchParams } from '@/types'
import FormularioBusqueda from './FormularioBusqueda'

// Formatear fecha helper (puro, sin dependencias del cliente)
function formatearFecha(fecha: Date | string | null): string {
  if (!fecha) return '-'
  return new Date(fecha).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

// ==================== SERVER COMPONENT ====================

export default async function InventarioPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  // Construir query de búsqueda
  const busqueda = searchParams.q || ''

  // Fetch directo a la BD (ejecutado en el servidor)
  // SQLite no soporta 'insensitive' mode, así que lo removemos
  const libros = await prisma.libro.findMany({
    where: busqueda
      ? {
        OR: [
          { titulo: { contains: busqueda } },
          { autor: { contains: busqueda } },
          { numeroRegistro: { contains: busqueda } },
        ],
      }
      : {},
    orderBy: { numero: 'asc' },
  })

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

      {/* Búsqueda - Client Component separado */}
      <FormularioBusqueda valorInicial={busqueda} />

      {/* Tabla */}
      {libros.length === 0 ? (
        <div className="card text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <p className="text-gray-500 mb-3">
            {busqueda ? 'No se encontraron libros' : 'No hay libros registrados'}
          </p>
          {!busqueda && (
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
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${libro.disponible > 0
                            ? 'bg-success-100 text-success-700'
                            : 'bg-danger-100 text-danger-700'
                          }`}>
                          {libro.disponible} / {libro.cantidad}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                        <Link
                          href={`/dashboard/inventario/${libro.id}/editar`}
                          className="text-brand-600 hover:text-brand-700"
                        >
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
