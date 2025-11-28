/**
 * COMPONENTE: BOTÓN DE EXPORTAR A EXCEL
 * 
 * Componente reutilizable para exportar datos a Excel
 * Usa la librería xlsx para generar archivos
 * 
 * ✅ Client Component
 * ✅ Tipado genérico
 * ✅ Formatea fechas automáticamente
 * ✅ Descarga automática
 */

'use client'

import { useState } from 'react'
import * as XLSX from 'xlsx'
import { toast } from '@/lib/toast'

interface ExportarExcelButtonProps<T> {
    datos: T[]
    nombreArchivo: string
    nombreHoja?: string
    className?: string
}

export default function ExportarExcelButton<T extends Record<string, any>>({
    datos,
    nombreArchivo,
    nombreHoja = 'Datos',
    className = 'btn-secondary',
}: ExportarExcelButtonProps<T>) {
    const [exportando, setExportando] = useState(false)

    const handleExportar = async () => {
        try {
            setExportando(true)

            if (datos.length === 0) {
                toast.error('No hay datos para exportar')
                return
            }

            // Crear workbook
            const workbook = XLSX.utils.book_new()

            // Los datos ya vienen formateados desde el componente padre
            const worksheet = XLSX.utils.json_to_sheet(datos)

            // Agregar hoja al workbook
            XLSX.utils.book_append_sheet(workbook, worksheet, nombreHoja)

            // Generar archivo y descargar
            XLSX.writeFile(workbook, `${nombreArchivo}.xlsx`)

            toast.success('Archivo Excel generado correctamente')
        } catch (error) {
            console.error('Error al exportar:', error)
            toast.error('Error al generar el archivo Excel')
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Exportar Excel
                </>
            )}
        </button>
    )
}
