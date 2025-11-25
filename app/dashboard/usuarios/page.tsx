'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Usuario {
  id: string
  email: string
  name: string
  role: string
  createdAt: string
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/usuarios')
      .then((res) => res.json())
      .then((data) => {
        setUsuarios(data)
        setLoading(false)
      })
  }, [])

  const admins = usuarios.filter(u => u.role === 'ADMIN')
  const users = usuarios.filter(u => u.role === 'USER')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
          <p className="text-gray-600 mt-1">Gestión de usuarios del sistema</p>
        </div>
        <Link href="/dashboard/usuarios/nuevo" className="btn-primary">
          + Nuevo Usuario
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card">
          <p className="text-sm font-medium text-gray-600 mb-1">Total</p>
          <p className="text-3xl font-bold text-gray-900">{usuarios.length}</p>
        </div>
        <div className="card bg-purple-50 border-purple-200">
          <p className="text-sm font-medium text-purple-700 mb-1">Administradores</p>
          <p className="text-3xl font-bold text-purple-700">{admins.length}</p>
        </div>
        <div className="card bg-blue-50 border-blue-200">
          <p className="text-sm font-medium text-blue-700 mb-1">Usuarios</p>
          <p className="text-3xl font-bold text-blue-700">{users.length}</p>
        </div>
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="card text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando usuarios...</p>
        </div>
      ) : usuarios.length === 0 ? (
        <div className="card text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <p className="text-gray-500 mb-3">No hay usuarios registrados</p>
          <Link href="/dashboard/usuarios/nuevo" className="btn-primary inline-block">
            Crear Primer Usuario
          </Link>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registro</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {usuarios.map((usuario) => (
                  <tr key={usuario.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-sm font-medium">
                            {usuario.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{usuario.name}</p>
                          <p className="text-xs text-gray-500">{usuario.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${usuario.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                        {usuario.role}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(usuario.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/dashboard/usuarios/${usuario.id}/editar`} className="text-purple-600 hover:text-purple-700">
                        Editar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
