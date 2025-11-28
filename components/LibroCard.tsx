import Link from 'next/link'
import { Libro } from '@prisma/client'

interface LibroCardProps {
  libro: Libro
}

export default function LibroCard({ libro }: LibroCardProps) {
  const disponibilidadPorcentaje =
    libro.cantidad > 0 ? (libro.disponible / libro.cantidad) * 100 : 0

  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-1">
            {libro.titulo}
          </h3>
          <p className="text-gray-600 text-sm">por {libro.autor}</p>
        </div>
      </div>

      <div className="flex gap-2 mb-3">
        {libro.numeroRegistro && (
          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
            Cód: {libro.numeroRegistro}
          </span>
        )}
        {libro.sigTop && (
          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700">
            {libro.sigTop}
          </span>
        )}
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">Disponibilidad</span>
          <span className="font-medium">
            {libro.disponible} / {libro.cantidad}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${disponibilidadPorcentaje > 50
                ? 'bg-green-500'
                : disponibilidadPorcentaje > 20
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
            style={{ width: `${disponibilidadPorcentaje}%` }}
          ></div>
        </div>
      </div>

      <div className="flex gap-2">
        <Link
          href={`/dashboard/inventario/${libro.id}`}
          className="flex-1 bg-indigo-600 text-white text-center py-2 rounded hover:bg-indigo-700 transition-colors text-sm"
        >
          Ver Detalles
        </Link>
        <Link
          href={`/dashboard/inventario/${libro.id}/editar`}
          className="flex-1 bg-gray-200 text-gray-700 text-center py-2 rounded hover:bg-gray-300 transition-colors text-sm"
        >
          Editar
        </Link>
      </div>
    </div>
  )
}


