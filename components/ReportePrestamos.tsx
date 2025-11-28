/**
 * COMPONENTE: REPORTE DE PRÉSTAMOS
 * 
 * ✅ Client Component
 * ✅ Selección de rango de fechas
 * ✅ Exportación a Excel
 */

'use client'

import { useState } from 'react'
import { obtenerPrestamosPorRango } from '@/lib/actions/prestamos'
import * as XLSX from 'xlsx'
import { toast } from '@/lib/toast'

export default function ReportePrestamos() {
    const [fechaInicio, setFechaInicio] = useState('')
    const [fechaFin, setFechaFin] = useState('')
    const [generando, setGenerando] = useState(false)

    const handleGenerarReporte = async () => {
        if (!fechaInicio || !fechaFin) {
            toast.error('Selecciona ambas fechas')
            return
        }

        if (new Date(fechaInicio) > new Date(fechaFin)) {
            toast.error('La fecha de inicio no puede ser mayor a la fecha fin')
            return
        }

        try {
            setGenerando(true)
            toast.message('Generando reporte...', 'Por favor espera')

            const datos = await obtenerPrestamosPorRango(new Date(fechaInicio), new Date(fechaFin))

            if (datos.length === 0) {
                toast.error('No se encontraron préstamos en ese rango')
                return
            }

            // Crear Excel
            const wb = XLSX.utils.book_new()
            const ws = XLSX.utils.json_to_sheet(datos)

            // Ancho de columnas
            const colWidths = [
                { wch: 30 }, // Libro
                { wch: 20 }, // Autor
                { wch: 15 }, // Código
                { wch: 20 }, // Prestatario
                { wch: 12 }, // DNI
                { wch: 25 }, // Email
                { wch: 15 }, // Fecha Préstamo
                { wch: 15 }, // Fecha Límite
                { wch: 15 }, // Fecha Devolución
                { wch: 12 }, // Estado
                { wch: 20 }, // Operador
                { wch: 30 }, // Observaciones
            ]
            ws['!cols'] = colWidths

            XLSX.utils.book_append_sheet(wb, ws, 'Reporte Préstamos')

            const nombreArchivo = `Reporte_Prestamos_${fechaInicio}_al_${fechaFin}.xlsx`
            XLSX.writeFile(wb, nombreArchivo)

            toast.success('Reporte descargado exitosamente')
        } catch (error) {
            console.error('Error:', error)
            toast.error('Error al generar el reporte')
        } finally {
            setGenerando(false)
        }
    }

    return (
        <div className="card bg-gray-50 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Generar Reporte de Préstamos</h3>

            <div className="flex flex-wrap items-end gap-4">
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
                    <input
                        type="date"
                        value={fechaInicio}
                        onChange={(e) => setFechaInicio(e.target.value)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500"
                    />
                </div>

                <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
                    <input
                        type="date"
                        value={fechaFin}
                        onChange={(e) => setFechaFin(e.target.value)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500"
                    />
                </div>

                <button
                    onClick={handleGenerarReporte}
                    disabled={generando}
                    className="btn-primary h-[42px] min-w-[180px]"
                >
                    {generando ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Generando...
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
            </div>
        </div>
    )
}
