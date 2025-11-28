/**
 * COMPONENTE: BOTÓN DE ELIMINAR LIBRO CON CONFIRMACIÓN
 * 
 * Botón reutilizable que usa confirmToast para eliminar libros
 * Solo se muestra si el usuario está autenticado
 * 
 * ✅ Client Component
 * ✅ Usa confirmToast
 * ✅ Spinner de carga
 * ✅ Colores semánticos
 */

'use client'

import { useState } from 'react'
import { eliminarLibro } from '@/lib/actions/libros'
import { toast, confirmToast } from '@/lib/toast'

interface EliminarLibroButtonProps {
    libroId: string
    libroTitulo: string
}

export default function EliminarLibroButton({
    libroId,
    libroTitulo,
}: EliminarLibroButtonProps) {
    const [eliminando, setEliminando] = useState(false)

    const handleEliminar = async () => {
        const confirmed = await confirmToast({
            title: '¿Eliminar libro?',
            description: `Se eliminará permanentemente el libro "${libroTitulo}". Esta acción no se puede deshacer.`,
            confirmText: 'Sí, eliminar',
            cancelText: 'Cancelar',
        })

        if (!confirmed) return

        try {
            setEliminando(true)

            const resultado = await eliminarLibro({ libroId })

            if (resultado.success) {
                toast.success('Libro eliminado correctamente')
            } else {
                toast.error(resultado.error || 'Error al eliminar libro')
            }
        } catch (error) {
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
            className="text-danger-600 hover:text-danger-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
            {eliminando ? 'Eliminando...' : 'Eliminar'}
        </button>
    )
}
