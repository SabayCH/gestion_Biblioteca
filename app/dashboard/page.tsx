import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return null
  }

  // Obtener estadísticas reales
  const totalLibros = await prisma.libro.count()
  const totalPrestamosActivos = await prisma.prestamo.count({
    where: { estado: 'ACTIVO' },
  })
  const totalPrestamos = await prisma.prestamo.count()
  const librosDisponibles = await prisma.libro.aggregate({
    _sum: { disponible: true },
  })

  // Obtener los últimos 8 préstamos
  const ultimosPrestamos = await prisma.prestamo.findMany({
    take: 8,
    orderBy: { createdAt: 'desc' },
    include: {
      libro: true,
      operador: true,
    },
  })

  const formatearFecha = (fecha: Date) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const getEstadoBadge = (estado: string) => {
    const badges = {
      ACTIVO: 'bg-warning-100 text-warning-700',
      DEVUELTO: 'bg-success-100 text-success-700',
      VENCIDO: 'bg-danger-100 text-danger-700',
    }
    return badges[estado as keyof typeof badges] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Bienvenido, {session.user.name}
        </h1>
        <p className="text-gray-600 mt-1">Panel de control del sistema</p>
      </div>

      {/* Estadísticas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 gradient-brand rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-brand-500/20">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
          <p className="text-sm font-medium text-gray-600">Total Libros</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{totalLibros}</p>
        </div>

        <div className="card group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 gradient-success rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-success-500/20">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-sm font-medium text-gray-600">Disponibles</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{librosDisponibles._sum.disponible || 0}</p>
        </div>

        <div className="card group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 gradient-warning rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-warning-500/20">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-sm font-medium text-gray-600">Préstamos Activos</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{totalPrestamosActivos}</p>
        </div>

        <div className="card group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 gradient-accent rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-accent-500/20">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <p className="text-sm font-medium text-gray-600">Total Préstamos</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{totalPrestamos}</p>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="grid grid-cols-3 gap-4">
        <Link href="/dashboard/inventario/nuevo" className="btn-primary text-center">
          + Nuevo Libro
        </Link>
        <Link href="/dashboard/prestamos/nuevo" className="btn-primary text-center">
          + Nuevo Préstamo
        </Link>
        <Link href="/dashboard/usuarios/nuevo" className="btn-secondary text-center">
          + Nuevo Usuario
        </Link>
      </div>

      {/* Actividad Reciente */}
      <div className="card p-0">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Actividad Reciente</h2>
          <Link href="/dashboard/prestamos" className="text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors">
            Ver todos →
          </Link>
        </div>

        {ultimosPrestamos.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-gray-500 mb-3">No hay actividad reciente</p>
            <Link href="/dashboard/prestamos/nuevo" className="btn-primary inline-block">
              Registrar Préstamo
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {ultimosPrestamos.map((prestamo) => (
              <div key={prestamo.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{prestamo.libro.titulo}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <p className="text-xs text-gray-500">
                        <span className="font-medium">Prestatario:</span> {prestamo.nombrePrestatario}
                      </p>
                      <p className="text-xs text-gray-500">
                        <span className="font-medium">DNI:</span> {prestamo.dni}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Fecha límite</p>
                      <p className="text-sm font-medium text-gray-700">{formatearFecha(prestamo.fechaLimite)}</p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getEstadoBadge(prestamo.estado)}`}>
                      {prestamo.estado}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
