import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import PrestamoCard from '@/components/PrestamoCard'

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
        <Link href="/dashboard/prestamos/nuevo" className="btn-primary">
          + Nuevo Préstamo
        </Link>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card">
          <p className="text-sm font-medium text-gray-600 mb-1">Total</p>
          <p className="text-3xl font-bold text-gray-900">{prestamos.length}</p>
        </div>
        <div className="card bg-amber-50 border-amber-200">
          <p className="text-sm font-medium text-amber-700 mb-1">Activos</p>
          <p className="text-3xl font-bold text-amber-700">{prestamosActivos.length}</p>
        </div>
        <div className="card bg-emerald-50 border-emerald-200">
          <p className="text-sm font-medium text-emerald-700 mb-1">Devueltos</p>
          <p className="text-3xl font-bold text-emerald-700">{prestamosDevueltos.length}</p>
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
