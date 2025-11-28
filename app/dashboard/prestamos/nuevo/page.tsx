/**
 * PÁGINA: CREAR NUEVO PRÉSTAMO
 * 
 * ✅ Server Component + Client Component híbrido
 * ✅ Server Actions
 * ✅ Colores semánticos
 * ✅ Toasts profesionales
 */

import { obtenerLibros } from '@/lib/actions/libros'
import FormularioNuevoPrestamo from './FormularioNuevoPrestamo'

export default async function NuevoPrestamoPage() {
  // Fetch de libros disponibles en el servidor
  const todosLosLibros = await obtenerLibros()
  const librosDisponibles = todosLosLibros.filter((l) => l.disponible > 0)

  return (
    <div className="max-w-2xl mx-auto">
      <FormularioNuevoPrestamo libros={librosDisponibles} />
    </div>
  )
}
