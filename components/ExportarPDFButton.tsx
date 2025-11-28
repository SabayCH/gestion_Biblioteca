/**
 * COMPONENTE: BOTÓN DE EXPORTAR A PDF (SIMPLE)
 * 
 * Usa solo jsPDF sin autoTable para evitar problemas de tipos
 * 
 * ✅ Client Component
 * ✅ PDF simple con tabla manual
 * ✅ Descarga automática
 */

'use client'

import { useState } from 'react'
import { jsPDF } from 'jspdf'
import { toast } from '@/lib/toast'

interface ExportarPDFButtonProps<T> {
    datos: T[]
    nombreArchivo: string
    titulo: string
    columnas: { header: string; dataKey: keyof T }[]
    className?: string
}

export default function ExportarPDFButton<T extends Record<string, any>>({
    datos,
    nombreArchivo,
    titulo,
    columnas,
    className = 'btn-secondary',
}: ExportarPDFButtonProps<T>) {
    const [exportando, setExportando] = useState(false)

    const handleExportar = async () => {
        try {
            setExportando(true)

            if (datos.length === 0) {
                toast.error('No hay datos para exportar')
                return
            }

            // Crear documento PDF
            const doc = new jsPDF()

            // Título
            doc.setFontSize(16)
            doc.setTextColor(124, 58, 237) // Color brand
            doc.text(titulo, 14, 20)

            // Fecha de generación
            doc.setFontSize(10)
            doc.setTextColor(100, 100, 100)
            doc.text(`Generado: ${new Date().toLocaleDateString('es-ES')}`, 14, 28)

            // Reset color para la tabla
            doc.setTextColor(0, 0, 0)
            doc.setFontSize(9)

            // Headers
            let y = 38
            doc.setFont('helvetica', 'bold')
            columnas.forEach((col, i) => {
                doc.text(col.header, 14 + (i * 35), y)
            })

            // Línea separadora
            y += 2
            doc.line(14, y, 195, y)
            y += 6

            // Datos
            doc.setFont('helvetica', 'normal')
            datos.forEach((fila: any, index) => {
                if (y > 280) { // Nueva página si es necesario
                    doc.addPage()
                    y = 20
                }

                columnas.forEach((col, i) => {
                    const valor = String(fila[col.dataKey] ?? '-')
                    const texto = valor.length > 20 ? valor.substring(0, 17) + '...' : valor
                    doc.text(texto, 14 + (i * 35), y)
                })

                y += 6
            })

            // Guardar PDF
            doc.save(`${nombreArchivo}.pdf`)

            toast.success('Archivo PDF generado correctamente')
        } catch (error) {
            console.error('Error al exportar:', error)
            toast.error('Error al generar el archivo PDF')
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Exportar PDF
                </>
            )}
        </button>
    )
}
