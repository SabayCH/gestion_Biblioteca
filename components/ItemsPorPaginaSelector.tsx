/**
 * SELECTOR DE ITEMS POR PÁGINA
 * 
 * ✅ Client Component
 * ✅ Actualiza la URL con el parámetro 'limit'
 */

'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'

export default function ItemsPorPaginaSelector() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const limit = Number(searchParams.get('limit')) || 50

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLimit = e.target.value
        const params = new URLSearchParams(searchParams.toString())
        params.set('limit', newLimit)
        params.set('page', '1') // Resetear a página 1
        router.push(`${pathname}?${params.toString()}`)
    }

    return (
        <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Mostrar:</span>
            <select
                value={limit}
                onChange={handleChange}
                className="form-select rounded-md border-gray-300 py-1 pl-2 pr-8 text-sm focus:border-brand-500 focus:ring-brand-500"
            >
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
            </select>
        </div>
    )
}
