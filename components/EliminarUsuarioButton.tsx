/**
 * COMPONENTE: BOTÓN DE ELIMINAR CON CONFIRMACIÓN
 * 
 * Botón reutilizable que usa confirmToast para eliminar usuarios
 * 
 * ✅ Confirmación con toast personalizado
 * ✅ Estados de loading
 * ✅ Server Action integrada
 */

'use client'

import { useState } from 'react'
import { eliminarUsuario } from '@/lib/actions/usuarios'
import { toast, confirmToast } from '@/lib/toast'

interface EliminarUsuarioButtonProps {
    usuarioId: string
    usuarioNombre: string
    className?: string
}

export default function EliminarUsuarioButton({
    usuarioId,
    usuarioNombre,
    className = '',
}: EliminarUsuarioButtonProps) {
    const [eliminando, setEliminando] = useState(false)

    const handleEliminar = async () => {
        // Confirmación con toast
        const confirmed = await confirmToast({
            title: '¿Eliminar usuario?',
            description: `Se eliminará permanentemente el usuario "${usuarioNombre}". Esta acción no se puede deshacer.`,
            confirmText: 'Sí, eliminar',
            cancelText: 'Cancelar',
        })

        if (!confirmed) return

        setEliminando(true)

        try {
            const resultado = await eliminarUsuario({ usuarioId })

            if (resultado.success) {
                toast.success('Usuario eliminado', `${usuarioNombre} ha sido eliminado del sistema`)
                // La página se recargará automáticamente por revalidatePath
            } else {
                toast.error(resultado.error || 'Error al eliminar usuario')
            }
        } catch (error: any) {
            console.error('Error:', error)
            toast.error('Error inesperado al eliminar')
        } finally {
            setEliminando(false)
        }
    }

    return (
        <button
            onClick={handleEliminar}
            disabled={eliminando}
            className={`text-danger-600 hover:text-danger-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        >
            {eliminando ? 'Eliminando...' : 'Eliminar'}
        </button>
    )
}
