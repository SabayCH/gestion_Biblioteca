'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { obtenerUsuarioPorId, actualizarUsuario } from '@/lib/actions/usuarios'
import { toast } from 'sonner'

export default function EditarUsuarioPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const { data: session } = useSession()
    const [loading, setLoading] = useState(false)
    const [loadingData, setLoadingData] = useState(true)
    const [error, setError] = useState('')
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'USER',
    })

    const isAdmin = (session?.user as any)?.role === 'ADMIN'
    const isOwnProfile = (session?.user as any)?.id === params.id

    // Cargar datos del usuario al montar el componente
    useEffect(() => {
        const fetchUsuario = async () => {
            try {
                const usuario = await obtenerUsuarioPorId(params.id)

                if (!usuario) {
                    throw new Error('Usuario no encontrado')
                }

                setFormData({
                    name: usuario.name || '',
                    email: usuario.email || '',
                    password: '', // No mostramos la contraseña actual
                    role: usuario.role || 'USER',
                })
            } catch (err: any) {
                setError(err.message)
                toast.error('Error al cargar usuario')
            } finally {
                setLoadingData(false)
            }
        }

        fetchUsuario()
    }, [params.id])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const updateData: any = {
                id: params.id,
                name: formData.name,
                email: formData.email,
            }

            // Solo enviar la contraseña si se ingresó una nueva
            if (formData.password.trim()) {
                updateData.password = formData.password
            }

            // Solo enviar el rol si es admin
            if (isAdmin) {
                updateData.role = formData.role
            }

            const result = await actualizarUsuario(updateData)

            if (!result.success) {
                throw new Error(result.error || 'Error al actualizar el usuario')
            }

            toast.success('Usuario actualizado correctamente')
            router.push('/dashboard/usuarios')
            router.refresh()
        } catch (err: any) {
            setError(err.message)
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (loadingData) {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-8">
                <Link
                    href="/dashboard/usuarios"
                    className="text-indigo-600 hover:text-indigo-700 mb-4 inline-block"
                >
                    ← Volver a usuarios
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">
                    {isOwnProfile ? 'Editar Mi Perfil' : 'Editar Usuario'}
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                {!isAdmin && !isOwnProfile && (
                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
                        No tienes permisos para editar este usuario
                    </div>
                )}

                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre Completo *
                    </label>
                    <input
                        type="text"
                        id="name"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                    </label>
                    <input
                        type="email"
                        id="email"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Nueva Contraseña (opcional)
                    </label>
                    <input
                        type="password"
                        id="password"
                        minLength={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Dejar en blanco para mantener la contraseña actual. Mínimo 6 caracteres.
                    </p>
                </div>

                {isAdmin && (
                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                            Rol *
                        </label>
                        <select
                            id="role"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        >
                            <option value="USER">Usuario</option>
                            <option value="ADMIN">Administrador</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                            Solo los administradores pueden cambiar roles
                        </p>
                    </div>
                )}

                {!isAdmin && (
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                        <p className="text-sm text-blue-700">
                            <strong>Nota:</strong> Solo puedes editar tu nombre, email y contraseña. Para cambiar tu rol, contacta a un administrador.
                        </p>
                    </div>
                )}

                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={loading || (!isAdmin && !isOwnProfile)}
                        className="flex-1 bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                    <Link
                        href="/dashboard/usuarios"
                        className="flex-1 bg-gray-200 text-gray-700 text-center py-2 rounded-md hover:bg-gray-300 transition-colors"
                    >
                        Cancelar
                    </Link>
                </div>
            </form>
        </div>
    )
}
