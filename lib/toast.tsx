/**
 * UTILIDADES DE TOASTS
 * 
 * Helpers simplificados para usar Sonner en la aplicación
 * Reemplaza completamente window.alert() y window.confirm()
 */

import { toast as sonnerToast } from 'sonner'

/**
 * Toasts básicos
 */
export const toast = {
    success: (message: string, description?: string) => {
        sonnerToast.success(message, { description })
    },

    error: (message: string, description?: string) => {
        sonnerToast.error(message, { description })
    },

    warning: (message: string, description?: string) => {
        sonnerToast.warning(message, { description })
    },

    info: (message: string, description?: string) => {
        sonnerToast.info(message, { description })
    },

    loading: (message: string) => {
        return sonnerToast.loading(message)
    },

    promise: <T,>(
        promise: Promise<T>,
        options: {
            loading: string
            success: string | ((data: T) => string)
            error: string | ((error: Error) => string)
        }
    ) => {
        return sonnerToast.promise(promise, options)
    },
}

/**
 * Reemplazo de window.confirm() con toast de confirmación
 * 
 * @example
 * const confirmed = await confirmToast({
 *   title: '¿Eliminar préstamo?',
 *   description: 'Esta acción no se puede deshacer',
 * })
 * if (confirmed) {
 *   // eliminar...
 * }
 */
export function confirmToast(options: {
    title: string
    description?: string
    confirmText?: string
    cancelText?: string
}): Promise<boolean> {
    return new Promise((resolve) => {
        const {
            title,
            description,
            confirmText = 'Confirmar',
            cancelText = 'Cancelar',
        } = options

        sonnerToast.custom(
            (t) => (
                <div className= "bg-white rounded-xl shadow-lg border border-gray-200 p-4 max-w-md" >
                <h3 className="text-base font-semibold text-gray-900 mb-1" >
                { title }
        </h3>
          { description && (
                <p className="text-sm text-gray-600 mb-4" > { description } </p>
        )
    }
          <div className="flex gap-2 justify-end" >
    <button
              onClick={() => {
        sonnerToast.dismiss(t)
                resolve(false)
    }}
className = "px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
    >
    { cancelText }
    </button>
    < button
onClick = {() => {
    sonnerToast.dismiss(t)
    resolve(true)
}}
className = "px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors"
    >
    { confirmText }
    </button>
    </div>
    </div>
      ),
{ duration: Infinity }
    )
  })
}
