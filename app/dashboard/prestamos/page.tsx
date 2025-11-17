import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import PrestamoCard from '@/components/PrestamoCard'

export default async function PrestamosPage() {
  const prestamos = await prisma.prestamo.findMany({
    include: {
      libro: true,
      user: true,
    },
    orderBy: { fechaPrestamo: 'desc' },
  })

  const prestamosActivos = prestamos.filter((p) => p.estado === 'ACTIVO')

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Préstamos</h1>
        <Link
          href="/dashboard/prestamos/nuevo"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          + Nuevo Préstamo
        </Link>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total Préstamos</p>
          <p className="text-2xl font-bold text-gray-900">{prestamos.length}</p>
        </div>
        <div className="bg-yellow-50 rounded-lg shadow p-4 border border-yellow-200">
          <p className="text-sm text-gray-600">Préstamos Activos</p>
          <p className="text-2xl font-bold text-yellow-700">{prestamosActivos.length}</p>
        </div>
        <div className="bg-green-50 rounded-lg shadow p-4 border border-green-200">
          <p className="text-sm text-gray-600">Préstamos Devueltos</p>
          <p className="text-2xl font-bold text-green-700">
            {prestamos.filter((p) => p.estado === 'DEVUELTO').length}
          </p>
        </div>
      </div>

      {/* Lista de préstamos */}
      {prestamos.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 text-lg mb-4">No hay préstamos registrados</p>
          <Link
            href="/dashboard/prestamos/nuevo"
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Crear el primer préstamo
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {prestamos.map((prestamo) => (
            <PrestamoCard key={prestamo.id} prestamo={prestamo} />
          ))}
        </div>
      )}
    </div>
  )
}

