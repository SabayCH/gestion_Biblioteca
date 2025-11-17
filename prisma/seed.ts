import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...')

  // Crear usuario administrador
  const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10)
  
  const admin = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@biblioteca.com' },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || 'admin@biblioteca.com',
      name: 'Administrador',
      password: adminPassword,
      role: 'ADMIN',
    },
  })

  console.log('✅ Usuario administrador creado:', admin.email)

  // Crear algunos libros de ejemplo
  const libros = [
    {
      titulo: 'El Quijote de la Mancha',
      autor: 'Miguel de Cervantes',
      isbn: '978-84-376-0494-7',
      editorial: 'Cátedra',
      anio: 1605,
      categoria: 'Literatura Clásica',
      descripcion: 'La obra más importante de la literatura española',
      cantidad: 5,
      disponible: 5,
    },
    {
      titulo: 'Cien años de soledad',
      autor: 'Gabriel García Márquez',
      isbn: '978-84-376-0495-4',
      editorial: 'Sudamericana',
      anio: 1967,
      categoria: 'Realismo Mágico',
      descripcion: 'Novela representativa del boom latinoamericano',
      cantidad: 3,
      disponible: 3,
    },
    {
      titulo: 'La sombra del viento',
      autor: 'Carlos Ruiz Zafón',
      isbn: '978-84-376-0496-1',
      editorial: 'Planeta',
      anio: 2001,
      categoria: 'Misterio',
      descripcion: 'Primera novela de la saga del Cementerio de los Libros Olvidados',
      cantidad: 4,
      disponible: 4,
    },
  ]

  for (const libro of libros) {
    const created = await prisma.libro.upsert({
      where: { isbn: libro.isbn },
      update: {},
      create: libro,
    })
    console.log(`✅ Libro creado: ${created.titulo}`)
  }

  console.log('🎉 Seed completado exitosamente!')
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

