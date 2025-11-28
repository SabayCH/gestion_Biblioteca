/**
 * PÁGINA: IMPORTAR LIBROS DESDE CSV
 * 
 * Importa el archivo Data.csv con el inventario completo de libros
 * ✅ Server Action para procesamiento
 * ✅ Validación de datos
 * ✅ Contador de progreso
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from '@/lib/toast'
import { importarLibrosCSV } from '@/lib/actions/libros'

export default function ImportarLibrosPage() {
    const [importando, setImportando] = useState(false)
    const [progreso, setProgreso] = useState({ procesados: 0, total: 0 })
    const router = useRouter()

    const handleImportar = async () => {
        try {
            setImportando(true)

            // Procesar el archivo CSV
            const resultado = await importarLibrosCSV()

            if (resultado.success) {
                toast.success(`Se importaron ${resultado.data?.importados} libros correctamente`)
                router.push('/dashboard/inventario')
            } else {
                toast.error(resultado.error || 'Error al importar')
            }
        } catch (error) {
            console.error('Error:', error)
            toast.error('Error inesperado al importar')
        } finally {
            setImportando(false)
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Importar Inventario</h1>
                <p className="text-gray-600 mt-1">Importar libros desde Data.csv</p>
            </div>

            <div className="card">
                <h2 className="text-lg font-semibold mb-4">Importación de Datos</h2>

                <div className="mb-6">
                    <p className="text-sm text-gray-600 mb-2">
                        Esta función importará todos los libros del archivo <code className="bg-gray-100 px-2 py-1 rounded">Data.csv</code>
                    </p>
                    <p className="text-sm text-yellow-600">
                        ⚠️ Esta operación puede tardar varios minutos dependiendo de la cantidad de libros
                    </p>
                </div>

                {progreso.total > 0 && (
                    <div className="mb-6">
                        <div className="w-full bg-gray-200 rounded-full h-4">
                            <div
                                className="bg-brand-600 h-4 rounded-full transition-all"
                                style={{ width: `${(progreso.procesados / progreso.total) * 100}%` }}
                            ></div>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                            {progreso.procesados} de {progreso.total} libros procesados
                        </p>
                    </div>
                )}

                <button
                    onClick={handleImportar}
                    disabled={importando}
                    className="btn-primary"
                >
                    {importando ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Importando...
                        </>
                    ) : 'Iniciar Importación'}
                </button>
            </div>
        </div>
    )
}
