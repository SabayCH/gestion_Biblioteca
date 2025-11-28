/**
 * PÁGINA: EDITAR LIBRO
 * 
 * ✅ Server Component para datos iniciales
 * ✅ Client Component solo para formulario
 * ✅ Server Actions
 * ✅ Colores semánticos
 */

import { obtenerLibroPorId } from '@/lib/actions/libros'
import { redirect } from 'next/navigation'
import FormularioEditarLibro from './FormularioEditarLibro'

export default async function EditarLibroPage({ params }: { params: { id: string } }) {
    // Fetch en el servidor
    const libro = await obtenerLibroPorId(params.id)

    if (!libro) {
        redirect('/dashboard/inventario')
    }

    return (
        <div className="space-y-6">
            {/* El formulario es un Client Component separado */}
            <FormularioEditarLibro libro={libro} />
        </div>
    )
}
