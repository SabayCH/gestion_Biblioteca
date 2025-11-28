/**
 * PÁGINA: CREAR NUEVO USUARIO
 * 
 * ✅ Usa Server Actions en lugar de API Routes
 * ✅ Notificaciones con Sonner (toast)
 * ✅ Colores semánticos (brand, danger, success)
 * ✅ Validación de formulario
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { crearUsuario } from '@/lib/actions/usuarios'
import { toast } from '@/lib/toast'

export default function NuevoUsuarioPage() {
  const router = useRouter()
  const [enviando, setEnviando] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setEnviando(true)

    try {
      const formData = new FormData(e.currentTarget)
      const resultado = await crearUsuario(formData)

      if (resultado.success) {
        toast.success('Usuario creado exitosamente', `Se ha creado el usuario correctamente`)
        router.push('/dashboard/usuarios')
        // No necesitas router.refresh() - revalidatePath lo hace automáticamente
      } else {
        toast.error(resultado.error || 'Error al crear usuario')

        // Mostrar errores de validación individuales
        if (resultado.errors) {
          Object.entries(resultado.errors).forEach(([field, messages]) => {
            messages.forEach((msg) => {
              toast.error(`${field}: ${msg}`)
            })
          })
        }
      }
    } catch (error: any) {
      console.error('Error inesperado:', error)
      toast.error('Error inesperado al crear usuario')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link
          href="/dashboard/usuarios"
          className="text-brand-600 hover:text-brand-700 mb-4 inline-flex items-center gap-2 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver a usuarios
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mt-2">Nuevo Usuario</h1>
        <p className="text-gray-600 mt-1">Crea una nueva cuenta de usuario en el sistema</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        {/* Nombre */}
        <div className="input-group">
          <label htmlFor="name" className="input-label">
            Nombre Completo <span className="text-danger-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            minLength={3}
            placeholder="Ej: Juan Pérez"
            disabled={enviando}
          />
          <p className="text-xs text-gray-500 mt-1">Mínimo 3 caracteres</p>
        </div>

        {/* Email */}
        <div className="input-group">
          <label htmlFor="email" className="input-label">
            Email <span className="text-danger-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            placeholder="usuario@ejemplo.com"
            disabled={enviando}
          />
          <p className="text-xs text-gray-500 mt-1">
            Este email se usará para iniciar sesión
          </p>
        </div>

        {/* Contraseña */}
        <div className="input-group">
          <label htmlFor="password" className="input-label">
            Contraseña <span className="text-danger-500">*</span>
          </label>
          <input
            type="password"
            id="password"
            name="password"
            required
            minLength={6}
            placeholder="••••••••"
            disabled={enviando}
          />
          <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
        </div>

        {/* Rol */}
        <div className="input-group">
          <label htmlFor="role" className="input-label">
            Rol <span className="text-danger-500">*</span>
          </label>
          <select
            id="role"
            name="role"
            required
            defaultValue="USER"
            disabled={enviando}
          >
            <option value="USER">Usuario Regular</option>
            <option value="ADMIN">Administrador</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Los administradores tienen acceso completo al sistema
          </p>
        </div>

        {/* Info de seguridad */}
        <div className="bg-info-50 border border-info-200 rounded-lg px-4 py-3">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-info-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-medium text-info-900">Información de seguridad</p>
              <p className="text-xs text-info-700 mt-1">
                La contraseña será hasheada y almacenada de forma segura. El usuario recibirá
                sus credenciales y deberá cambiar su contraseña en el primer inicio de sesión.
              </p>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-4 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={enviando}
            className="btn-primary flex-1"
          >
            {enviando ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creando...
              </span>
            ) : (
              'Crear Usuario'
            )}
          </button>
          <Link
            href="/dashboard/usuarios"
            className="btn-secondary flex-1 text-center"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
