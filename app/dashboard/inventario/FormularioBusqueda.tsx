/**
 * FORMULARIO DE BÚSQUEDA - CLIENT COMPONENT
 * 
 * Componente separado para manejar la interactividad del formulario
 * mientras el resto de la página permanece como Server Component
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function FormularioBusqueda({ valorInicial }: { valorInicial: string }) {
    const [busqueda, setBusqueda] = useState(valorInicial)
    const router = useRouter()

    const aplicarBusqueda = () => {
        const params = new URLSearchParams()
        if (busqueda) params.set('q', busqueda)
        router.push(`/dashboard/inventario?${params.toString()}`)
    }

    const limpiarBusqueda = () => {
        setBusqueda('')
        router.push('/dashboard/inventario')
    }

    return (
        <div className="card">
            <div className="flex gap-3">
                <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && aplicarBusqueda()}
                    placeholder="Buscar por título, autor o número de registro..."
                    className="flex-1"
                />
                <button onClick={aplicarBusqueda} className="btn-primary">
                    Buscar
                </button>
                {busqueda && (
                    <button onClick={limpiarBusqueda} className="btn-secondary">
                        Limpiar
                    </button>
                )}
            </div>
        </div>
    )
}
