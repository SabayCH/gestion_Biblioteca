import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import PrestamoCard from '@/components/PrestamoCard'
import ExportarExcelButton from '@/components/ExportarExcelButton'
import ExportarPDFButton from '@/components/ExportarPDFButton'
import ReportePrestamos from '@/components/ReportePrestamos'
import { type SearchParams } from '@/types'

export default async function PrestamosPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const paginaActual = Number(searchParams.page) || 1
  const limite = 20 // Límite fijo de 20 por página para préstamos
  const skip = (paginaActual - 1) * limite

  // Obtener total de préstamos para paginación
  const totalPrestamos = await prisma.prestamo.count()
  const totalPaginas = Math.ceil(totalPrestamos / limite)

  // Obtener préstamos paginados
  const prestamos = await prisma.prestamo.findMany({
    include: {
      libro: true,
      operador: true,
    },
    orderBy: { fechaPrestamo: 'desc' },
    skip: skip,
    take: limite,
  })

  // Estadísticas (estas sí deben ser sobre el total, no solo la página actual)
  const totalActivos = await prisma.prestamo.count({ where: { estado: 'ACTIVO' } })
  const totalDevueltos = await prisma.prestamo.count({ where: { estado: 'DEVUELTO' } })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Préstamos</h1>
          <p className="text-gray-600 mt-1">Gestión de préstamos de libros</p>
        </div>
        <div className="flex flex-wrap gap-3 w-full lg:w-auto">
          <Link href="/dashboard/prestamos/nuevo" className="btn-primary flex-1 lg:flex-none justify-center">
            + Nuevo Préstamo
          </Link>
        </div>
      </div>

      {/* Sección de Reportes (Movido arriba) */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Reportes y Exportación</h2>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <ReportePrestamos />
          </div>
          <div className="flex flex-col gap-3 justify-end pb-1">
            <p className="text-sm text-gray-500 mb-1">Exportar página actual:</p>
            <div className="flex gap-2">
              <ExportarExcelButton
                datos={prestamos.map(p => ({
                  'Libro': p.libro.titulo,
                  'Prestatario': p.nombrePrestatario,
                  'DNI': p.dni,
                  'Fecha Préstamo': new Date(p.fechaPrestamo).toLocaleDateString('es-ES'),
                  'Fecha Límite': new Date(p.fechaLimite).toLocaleDateString('es-ES'),
                  'Fecha Devolución': p.fechaDevolucion ? new Date(p.fechaDevolucion).toLocaleDateString('es-ES') : '-',
                  'Estado': p.estado,
                  'Operador': p.operador.name,
                }))}
                nombreArchivo={`Prestamos_Pagina_${paginaActual}`}
                nombreHoja="Préstamos"
                className="btn-secondary text-sm"
              />
              <ExportarPDFButton
                datos={prestamos.map(p => ({
                  libro: p.libro.titulo,
                  prestatario: p.nombrePrestatario,
                  dni: p.dni,
                  fechaPrestamo: new Date(p.fechaPrestamo).toLocaleDateString('es-ES'),
                  fechaLimite: new Date(p.fechaLimite).toLocaleDateString('es-ES'),
                  estado: p.estado,
                }))}
                titulo={`Reporte de Préstamos (Página ${paginaActual})`}
                nombreArchivo={`Reporte_Prestamos_Pagina_${paginaActual}`}
                columnas={[
                  { header: 'Libro', dataKey: 'libro' },
                  { header: 'Prestatario', dataKey: 'prestatario' },
                  { header: 'DNI', dataKey: 'dni' },
                  { header: 'Fecha Préstamo', dataKey: 'fechaPrestamo' },
                  { header: 'Fecha Límite', dataKey: 'fechaLimite' },
                  { header: 'Estado', dataKey: 'estado' },
                ]}
                className="btn-secondary text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card">
          <p className="text-sm font-medium text-gray-600 mb-1">Total Histórico</p>
          <p className="text-3xl font-bold text-gray-900">{totalPrestamos}</p>
        </div>
        <div className="card bg-warning-50 border-warning-200">
          <p className="text-sm font-medium text-warning-700 mb-1">Activos Ahora</p>
          <p className="text-3xl font-bold text-warning-700">{totalActivos}</p>
        </div>
        <div className="card bg-success-50 border-success-200">
          <p className="text-sm font-medium text-success-700 mb-1">Devueltos</p>
          <p className="text-3xl font-bold text-success-700">{totalDevueltos}</p>
        </div>
      </div>

      {/* Lista */}
      {prestamos.length === 0 ? (
        <div className="card text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-gray-500 mb-3">No hay préstamos registrados</p>
          <Link href="/dashboard/prestamos/nuevo" className="btn-primary inline-block">
            Crear Primer Préstamo
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {prestamos.map((prestamo) => (
              <PrestamoCard key={prestamo.id} prestamo={prestamo} />
            ))}
          </div>

          {/* Paginación */}
          {totalPaginas > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mt-6">
              <p className="text-sm text-gray-600 text-center sm:text-left">
                Mostrando <span className="font-medium">{(paginaActual - 1) * limite + 1}</span> - <span className="font-medium">{Math.min(paginaActual * limite, totalPrestamos)}</span> de <span className="font-medium">{totalPrestamos}</span>
              </p>

              <div className="flex gap-2 justify-center">
                {paginaActual > 1 && (
                  <Link
                    href={`/dashboard/prestamos?page=${paginaActual - 1}`}
                    className="btn-secondary px-3 py-2 text-sm"
                  >
                    ← Anterior
                  </Link>
                )}

                <span className="flex items-center px-4 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg">
                  Página {paginaActual} de {totalPaginas}
                </span>

                {paginaActual < totalPaginas && (
                  <Link
                    href={`/dashboard/prestamos?page=${paginaActual + 1}`}
                    className="btn-secondary px-3 py-2 text-sm"
                  >
                    Siguiente →
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
