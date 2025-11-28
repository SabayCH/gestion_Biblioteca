/**
 * TOAST PROVIDER - SONNER
 * 
 * Proveedor global de notificaciones toast usando Sonner
 * Reemplaza window.alert() y window.confirm()
 */

'use client'

import { Toaster } from 'sonner'

export default function ToastProvider() {
    return (
        <Toaster
            position="top-right"
            richColors
            closeButton
            theme="light"
            toastOptions={{
                duration: 4000,
                style: {
                    fontFamily: 'Inter, sans-serif',
                },
                classNames: {
                    toast: 'rounded-xl shadow-lg border',
                    title: 'font-medium',
                    description: 'text-sm',
                    success: 'border-success-200 bg-success-50',
                    error: 'border-danger-200 bg-danger-50',
                    warning: 'border-warning-200 bg-warning-50',
                    info: 'border-info-200 bg-info-50',
                },
            }}
        />
    )
}
