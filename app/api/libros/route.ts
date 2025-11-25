import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const libroSchema = z.object({
  fechaRegistro: z.string().optional().nullable(),
  numeroRegistro: z.string().optional().nullable(),
  titulo: z.string().min(1, { message: 'Título es requerido' }),
  autor: z.string().optional().nullable(),
  cantidad: z.number().int().min(1).default(1),
  disponible: z.number().int().min(0).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') // Búsqueda general
    const titulo = searchParams.get('titulo')
    const autor = searchParams.get('autor')
    const numeroRegistro = searchParams.get('numeroRegistro')

    // Construir filtro dinámico
    const whereClause: any = {}

    if (q) {
      // Búsqueda general en múltiples campos
      whereClause.OR = [
        { titulo: { contains: q, mode: 'insensitive' } },
        { autor: { contains: q, mode: 'insensitive' } },
        { numeroRegistro: { contains: q } },
      ]
    } else {
      // Filtros específicos por columna
      if (titulo) {
        whereClause.titulo = { contains: titulo, mode: 'insensitive' }
      }
      if (autor) {
        whereClause.autor = { contains: autor, mode: 'insensitive' }
      }
      if (numeroRegistro) {
        whereClause.numeroRegistro = { contains: numeroRegistro }
      }
    }

    const libros = await prisma.libro.findMany({
      where: whereClause,
      orderBy: { numero: 'asc' },
    })

    return NextResponse.json(libros)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error al obtener libros' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const parsedBody = libroSchema.safeParse(body)

    if (!parsedBody.success) {
      return NextResponse.json({ error: parsedBody.error.issues }, { status: 400 })
    }

    const data = parsedBody.data

    // Calcular el siguiente número consecutivo
    const ultimoLibro = await prisma.libro.findFirst({
      orderBy: { numero: 'desc' },
      select: { numero: true },
    })
    const siguienteNumero = (ultimoLibro?.numero || 0) + 1

    // Convertir fechaRegistro de string a DateTime si existe
    const fechaRegistroDate = data.fechaRegistro ? new Date(data.fechaRegistro) : null

    const libro = await prisma.libro.create({
      data: {
        numero: siguienteNumero,
        fechaRegistro: fechaRegistroDate,
        numeroRegistro: data.numeroRegistro || null,
        titulo: data.titulo,
        autor: data.autor ?? null,
        cantidad: data.cantidad,
        disponible: data.disponible ?? data.cantidad,
      },
    })

    return NextResponse.json(libro, { status: 201 })
  } catch (error: any) {
    console.error(error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    return NextResponse.json(
      { error: 'Error interno del servidor al crear el libro' },
      { status: 500 }
    )
  }
}
