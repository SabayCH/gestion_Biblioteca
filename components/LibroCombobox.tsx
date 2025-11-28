/**
 * COMPONENTE: SELECTOR DE LIBROS CON BÚSQUEDA (COMBOBOX)
 * 
 * ✅ Client Component
 * ✅ Filtra libros en tiempo real
 * ✅ Optimizado para móviles (evita listas gigantes)
 * ✅ Accesible
 */

'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { type Libro } from '@/types'

interface LibroComboboxProps {
    libros: Libro[]
    name?: string
    disabled?: boolean
    required?: boolean
    onSelect?: (libro: Libro) => void
}

export default function LibroCombobox({ libros, name, disabled, required, onSelect }: LibroComboboxProps) {
    const [busqueda, setBusqueda] = useState('')
    const [isOpen, setIsOpen] = useState(false)
    const [libroSeleccionado, setLibroSeleccionado] = useState<Libro | null>(null)
    const wrapperRef = useRef<HTMLDivElement>(null)

    // Filtrar libros (memoizado para rendimiento)
    const librosFiltrados = useMemo(() => {
        if (!busqueda) return libros.slice(0, 50) // Mostrar solo los primeros 50 si no hay búsqueda

        const q = busqueda.toLowerCase()
        return libros.filter(libro =>
            libro.titulo.toLowerCase().includes(q) ||
            (libro.autor && libro.autor.toLowerCase().includes(q)) ||
            (libro.numeroRegistro && libro.numeroRegistro.toLowerCase().includes(q))
        ).slice(0, 50) // Limitar resultados para no saturar el DOM
    }, [libros, busqueda])

    // Cerrar al hacer click fuera
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleSeleccionar = (libro: Libro) => {
        if (onSelect) {
            onSelect(libro)
            setBusqueda('')
            setIsOpen(false)
            return
        }

        setLibroSeleccionado(libro)
        setBusqueda('')
        setIsOpen(false)
    }

    const handleLimpiar = () => {
        setLibroSeleccionado(null)
        setBusqueda('')
    }

    return (
        <div className="relative" ref={wrapperRef}>
            {/* Input oculto para enviar el valor en el form */}
            <input
                type="hidden"
                name={name}
                value={libroSeleccionado?.id || ''}
                required={required}
            />

            {libroSeleccionado ? (
                // Vista de libro seleccionado
                <div className="flex items-center justify-between p-3 border border-brand-200 bg-brand-50 rounded-lg">
                    <div className="flex-1 min-w-0 mr-2">
                        <p className="text-sm font-medium text-brand-900 truncate">{libroSeleccionado.titulo}</p>
                        <p className="text-xs text-brand-600 truncate">
                            {libroSeleccionado.autor || 'Sin autor'} • Código: {libroSeleccionado.numeroRegistro || '-'}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleLimpiar}
                        disabled={disabled}
                        className="text-brand-400 hover:text-brand-600 p-1 rounded-full hover:bg-brand-100 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            ) : (
                // Input de búsqueda
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        className="form-input pl-10 w-full"
                        placeholder="Buscar por título, autor o código..."
                        value={busqueda}
                        onChange={(e) => {
                            setBusqueda(e.target.value)
                            setIsOpen(true)
                        }}
                        onFocus={() => setIsOpen(true)}
                        disabled={disabled}
                    />
                </div>
            )}

            {/* Lista desplegable */}
            {isOpen && !libroSeleccionado && !disabled && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {librosFiltrados.length === 0 ? (
                        <div className="p-3 text-sm text-gray-500 text-center">
                            No se encontraron libros
                        </div>
                    ) : (
                        <ul className="py-1 divide-y divide-gray-100">
                            {librosFiltrados.map((libro) => (
                                <li key={libro.id}>
                                    <button
                                        type="button"
                                        className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors"
                                        onClick={() => handleSeleccionar(libro)}
                                    >
                                        <p className="text-sm font-medium text-gray-900 truncate">{libro.titulo}</p>
                                        <div className="flex justify-between items-center mt-0.5">
                                            <p className="text-xs text-gray-500 truncate max-w-[70%]">
                                                {libro.autor || 'Sin autor'}
                                            </p>
                                            <span className="text-xs font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
                                                Disp: {libro.disponible}
                                            </span>
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    )
}
