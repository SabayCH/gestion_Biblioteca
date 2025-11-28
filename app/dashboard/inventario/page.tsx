/**
 * PÁGINA DE INVENTARIO CON PAGINACIÓN DINÁMICA
 * 
 * ✅ Server Component
 * ✅ Paginación configurable (20/50/100)
 * ✅ Exportación completa
 * ✅ Búsqueda integrada
 * ✅ Diseño Responsivo Premium
 */

import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { type SearchParams } from '@/types'
import FormularioBusqueda from './FormularioBusqueda'
import EliminarLibroButton from '@/components/EliminarLibroButton'
import ExportarInventarioButton from '@/components/ExportarInventarioButton'
import ItemsPorPaginaSelector from '@/components/ItemsPorPaginaSelector'

export default async function InventarioPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const busqueda = searchParams.q || ''
  const paginaActual = Number(searchParams.page) || 1
  const limite = Number(searchParams.limit) || 50

  // Construir query de búsqueda
  const whereClause: any = busqueda
    ? {
      OR: [
        { titulo: { contains: busqueda } },
        { autor: { contains: busqueda } },
        { numeroRegistro: { contains: busqueda } },
        { sigTop: { contains: busqueda } },
      ],
    }
    : {}

  // Obtener total de libros
  const totalLibros = await prisma.libro.count({ where: whereClause })
  const totalPaginas = Math.ceil(totalLibros / limite)

  // Obtener libros de la página actual
  const libros = await prisma.libro.findMany({
    where: whereClause,
    orderBy: { numero: 'asc' },
    skip: (paginaActual - 1) * limite,
    take: limite,
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventario</h1>
          <p className="text-gray-600 mt-1">
            {totalLibros} libro(s) en total
          </p>
        </div>
        <div className="flex flex-wrap gap-3 w-full lg:w-auto">
          <Link href="/dashboard/inventario/importar" className="btn-secondary flex-1 lg:flex-none justify-center">
            📥 Importar
          </Link>
          <ExportarInventarioButton busqueda={busqueda} className="btn-secondary flex-1 lg:flex-none justify-center" />
          <Link href="/dashboard/inventario/nuevo" className="btn-primary flex-1 lg:flex-none justify-center">
            + Agregar
          </Link>
        </div>
      </div>

      {/* Búsqueda y Filtros */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="w-full lg:flex-1">
          <FormularioBusqueda valorInicial={busqueda} />
        </div>
        <ItemsPorPaginaSelector />
      </div>

      {/* Tabla */}
      {libros.length === 0 ? (
        <div className="card text-center py-12">
          <div className="w-16 h-16 bg-gray-50 rounded-full mx-auto mb-4 flex items-center justify-center">
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
          <div className="table-container">
            <table className="table-responsive">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="th-base">SIG. TOP</th>
                  <th className="th-base">Código</th>
                  <th className="th-base">Autor</th>
                  <th className="th-base">Título</th>
                  <th className="th-base">Edición</th>
                  <th className="th-base text-center">Cant.</th>
                  <th className="th-base text-center">Disp.</th>
                  <th className="th-base text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {libros.map((libro) => (
                  <tr key={libro.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="td-base text-gray-600">{libro.sigTop || '-'}</td>
                    <td className="td-base font-medium text-gray-900">{libro.numeroRegistro || '-'}</td>
                    <td className="td-base text-gray-600 max-w-[200px] truncate" title={libro.autor || ''}>{libro.autor || '-'}</td>
                    <td className="td-base font-medium text-gray-900 max-w-[300px] truncate" title={libro.titulo}>{libro.titulo}</td>
                    <td className="td-base text-gray-600">{libro.edicion || '-'}</td>
                    <td className="td-base text-center font-medium text-gray-900">{libro.cantidad}</td>
                    <td className="td-base text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${libro.disponible > 0
                          ? 'bg-success-100 text-success-700'
                          : 'bg-danger-100 text-danger-700'
                        }`}>
                        {libro.disponible}
                      </span>
                    </td>
                    <td className="td-base text-right font-medium space-x-3">
                      <Link
                        href={`/dashboard/inventario/${libro.id}/editar`}
                        className="text-brand-600 hover:text-brand-700 transition-colors"
                      >
                        Editar
                      </Link>
                      <EliminarLibroButton
                        libroId={libro.id}
                        libroTitulo={libro.titulo}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {totalPaginas > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-sm text-gray-600 text-center sm:text-left">
                Mostrando <span className="font-medium">{(paginaActual - 1) * limite + 1}</span> - <span className="font-medium">{Math.min(paginaActual * limite, totalLibros)}</span> de <span className="font-medium">{totalLibros}</span>
              </p>

              <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto justify-center sm:justify-end">
                {paginaActual > 1 && (
                  <Link
                    href={`/dashboard/inventario?${busqueda ? `q=${busqueda}&` : ''}page=${paginaActual - 1}&limit=${limite}`}
                    className="btn-secondary px-3 py-2 text-sm"
                  >
                    ←
                  </Link>
                )}

                <div className="flex gap-1">
                  {Array.from({ length: Math.min(totalPaginas, 5) }, (_, i) => {
                    // Lógica simple de paginación para mostrar ventana alrededor de página actual
                    let pageNum = i + 1
                    if (totalPaginas > 5 && paginaActual > 3) {
                      pageNum = paginaActual - 2 + i
                    }
                    if (pageNum > totalPaginas) return null

                    return (
                      <Link
                        key={pageNum}
                        href={`/dashboard/inventario?${busqueda ? `q=${busqueda}&` : ''}page=${pageNum}&limit=${limite}`}
                        className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${pageNum === paginaActual
                            ? 'bg-brand-600 text-white shadow-md shadow-brand-500/30'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                          }`}
                      >
                        {pageNum}
                      </Link>
                    )
                  })}
                </div>

                {paginaActual < totalPaginas && (
                  <Link
                    href={`/dashboard/inventario?${busqueda ? `q=${busqueda}&` : ''}page=${paginaActual + 1}&limit=${limite}`}
                    className="btn-secondary px-3 py-2 text-sm"
                  >
                    →
                  </Link>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
