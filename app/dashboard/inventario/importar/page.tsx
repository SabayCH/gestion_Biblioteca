/**
 * PÁGINA: IMPORTAR LIBROS DESDE CSV
 * 
 * Importa el archivo CSV con el inventario completo de libros
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
    const [archivo, setArchivo] = useState<File | null>(null)
    const router = useRouter()

    const handleImportar = async () => {
        if (!archivo) {
            toast.error('Por favor selecciona un archivo CSV')
            return
        }

        try {
            setImportando(true)

            const formData = new FormData()
            formData.append('file', archivo)

            // Procesar el archivo CSV
            const resultado = await importarLibrosCSV(formData)

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
                <p className="text-gray-600 mt-1">Importar libros desde archivo CSV</p>
            </div>

            <div className="card">
                <h2 className="text-lg font-semibold mb-4">Importación de Datos</h2>

                <div className="mb-6">
                    <p className="text-sm text-gray-600 mb-2">
                        Selecciona un archivo CSV con el formato correcto para importar los libros.
                    </p>
                    <p className="text-sm text-yellow-600 mb-4">
                        ⚠️ Esta operación puede tardar varios minutos dependiendo de la cantidad de libros
                    </p>

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
                        <input
                            type="file"
                            accept=".csv"
                            onChange={(e) => setArchivo(e.target.files?.[0] || null)}
                            className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-brand-50 file:text-brand-700
                                hover:file:bg-brand-100
                            "
                        />
                        {archivo && (
                            <p className="mt-2 text-sm text-green-600 font-medium">
                                Archivo seleccionado: {archivo.name}
                            </p>
                        )}
                    </div>
                </div>

                <button
                    onClick={handleImportar}
                    disabled={importando || !archivo}
                    className="btn-primary w-full sm:w-auto"
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
