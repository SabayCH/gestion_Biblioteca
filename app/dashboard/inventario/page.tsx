import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import LibroCard from '@/components/LibroCard'

export default async function InventarioPage() {
  const libros = await prisma.libro.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Inventario de Libros</h1>
        <Link
          href="/dashboard/inventario/nuevo"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          + Agregar Libro
        </Link>
      </div>

      {libros.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 text-lg mb-4">No hay libros registrados</p>
          <Link
            href="/dashboard/inventario/nuevo"
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Agregar el primer libro
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {libros.map((libro) => (
            <LibroCard key={libro.id} libro={libro} />
          ))}
        </div>
      )}
    </div>
  )
}

