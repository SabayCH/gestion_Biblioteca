import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

import { z } from 'zod'

const libroSchema = z.object({
  titulo: z.string().min(1, { message: 'Título es requerido' }),
  autor: z.string().min(1, { message: 'Autor es requerido' }),
  isbn: z.string().optional(),
  editorial: z.string().optional(),
  anio: z.number().int().positive().optional(),
  categoria: z.string().optional(),
  descripcion: z.string().optional(),
  cantidad: z.number().int().min(0).default(1),
  disponible: z.number().int().min(0).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    const whereClause = query
      ? {
          OR: [
            { titulo: { contains: query, mode: 'insensitive' } },
            { autor: { contains: query, mode: 'insensitive' } },
            { isbn: { contains: query } },
          ],
        }
      : {}

    const libros = await prisma.libro.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
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
      return NextResponse.json({ error: parsedBody.error.errors }, { status: 400 })
    }
    const { isbn, ...data } = parsedBody.data

    // Verificar si el ISBN ya existe
    if (isbn) {
      const existingLibro = await prisma.libro.findUnique({
        where: { isbn },
      })
      if (existingLibro) {
        return NextResponse.json(
          { error: 'Ya existe un libro con este ISBN' },
          { status: 400 }
        )
      }
    }

    const libro = await prisma.libro.create({
      data: {
        ...data,
        isbn: isbn || null,
        // Si 'disponible' no se especifica, es igual a 'cantidad'.
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
