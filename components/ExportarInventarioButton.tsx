/**
 * BOTÓN PARA EXPORTAR INVENTARIO COMPLETO
 * 
 * ✅ Client Component
 * ✅ Descarga bajo demanda (Lazy loading)
 * ✅ Exporta TODOS los libros filtrados
 */

'use client'

import { useState } from 'react'
import { obtenerLibrosParaExportar } from '@/lib/actions/libros'
import { utils, writeFile } from 'xlsx'
import { toast } from '@/lib/toast'

interface ExportarInventarioButtonProps {
    busqueda?: string
    className?: string
}

export default function ExportarInventarioButton({
    busqueda = '',
    className = 'btn-secondary',
}: ExportarInventarioButtonProps) {
    const [exportando, setExportando] = useState(false)

    const handleExportar = async () => {
        try {
            setExportando(true)
            toast.info('Preparando archivo...', 'Esto puede tomar unos segundos')

            // 1. Obtener datos del servidor
            const datos = await obtenerLibrosParaExportar(busqueda)

            if (datos.length === 0) {
                toast.error('No hay datos para exportar')
                return
            }

            // 2. Crear libro de Excel
            const wb = utils.book_new()
            const ws = utils.json_to_sheet(datos)

            // Ajustar ancho de columnas
            const colWidths = [
                { wch: 15 }, // SIG. TOP
                { wch: 15 }, // Código
                { wch: 25 }, // Autor
                { wch: 40 }, // Título
                { wch: 15 }, // Edición
                { wch: 10 }, // Cantidad
                { wch: 12 }, // Disponibles
                { wch: 15 }, // Fecha
            ]
            ws['!cols'] = colWidths

            utils.book_append_sheet(wb, ws, 'Inventario')

            // 3. Descargar archivo
            const nombreArchivo = `Inventario_Completo_${new Date().toLocaleDateString('es-ES').replace(/\//g, '-')}.xlsx`
            writeFile(wb, nombreArchivo)

            toast.success('Archivo descargado correctamente')
        } catch (error: any) {
            console.error('Error al exportar:', error)
            toast.error('Error al generar el archivo Excel', error.message)
        } finally {
            setExportando(false)
        }
    }

    return (
        <button
            onClick={handleExportar}
            disabled={exportando}
            className={className}
        >
            {exportando ? (
                <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Exportando...
                </>
            ) : (
                <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Exportar Todo (Excel)
                </>
            )}
        </button>
    )
}
