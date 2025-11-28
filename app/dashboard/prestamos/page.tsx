import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import PrestamoCard from '@/components/PrestamoCard'
import ExportarExcelButton from '@/components/ExportarExcelButton'
import ExportarPDFButton from '@/components/ExportarPDFButton'

export default async function PrestamosPage() {
  const prestamos = await prisma.prestamo.findMany({
    include: {
      libro: true,
      operador: true,
    },
    orderBy: { fechaPrestamo: 'desc' },
  })

  const prestamosActivos = prestamos.filter((p) => p.estado === 'ACTIVO')
  const prestamosDevueltos = prestamos.filter((p) => p.estado === 'DEVUELTO')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Préstamos</h1>
          <p className="text-gray-600 mt-1">Gestión de préstamos de libros</p>
        </div>
        <div className="flex gap-3">
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
            nombreArchivo={`Prestamos_${new Date().toLocaleDateString('es-ES').replace(/\//g, '-')}`}
            nombreHoja="Préstamos"
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
            titulo="Reporte de Préstamos"
            nombreArchivo={`Reporte_Prestamos_${new Date().toLocaleDateString('es-ES').replace(/\//g, '-')}`}
            columnas={[
              { header: 'Libro', dataKey: 'libro' },
              { header: 'Prestatario', dataKey: 'prestatario' },
              { header: 'DNI', dataKey: 'dni' },
              { header: 'Fecha Préstamo', dataKey: 'fechaPrestamo' },
              { header: 'Fecha Límite', dataKey: 'fechaLimite' },
              { header: 'Estado', dataKey: 'estado' },
            ]}
          />
          <Link href="/dashboard/prestamos/nuevo" className="btn-primary">
            + Nuevo Préstamo
          </Link>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card">
          <p className="text-sm font-medium text-gray-600 mb-1">Total</p>
          <p className="text-3xl font-bold text-gray-900">{prestamos.length}</p>
        </div>
        <div className="card bg-warning-50 border-warning-200">
          <p className="text-sm font-medium text-warning-700 mb-1">Activos</p>
          <p className="text-3xl font-bold text-warning-700">{prestamosActivos.length}</p>
        </div>
        <div className="card bg-success-50 border-success-200">
          <p className="text-sm font-medium text-success-700 mb-1">Devueltos</p>
          <p className="text-3xl font-bold text-success-700">{prestamosDevueltos.length}</p>
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
        <div className="space-y-3">
          {prestamos.map((prestamo) => (
            <PrestamoCard key={prestamo.id} prestamo={prestamo} />
          ))}
        </div>
      )}
    </div>
  )
}
