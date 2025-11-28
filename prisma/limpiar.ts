/**
 * SCRIPT DE LIMPIEZA DE BASE DE DATOS
 * 
 * Elimina:
 * - Todos los préstamos
 * - Todos los libros
 * - Todas las auditorías
 * - Todos los usuarios excepto el admin
 * 
 * Uso: npx tsx prisma/limpiar.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function limpiar() {
    console.log('🧹 Iniciando limpieza de base de datos...\n')

    try {
        // 1. Eliminar todos los préstamos
        const prestamosResult = await prisma.prestamo.deleteMany({})
        console.log(`✅ Eliminados ${prestamosResult.count} préstamos`)

        // 2. Eliminar todos los libros
        const librosResult = await prisma.libro.deleteMany({})
        console.log(`✅ Eliminados ${librosResult.count} libros`)

        // 3. Eliminar todas las auditorías
        const auditResult = await prisma.auditLog.deleteMany({})
        console.log(`✅ Eliminadas ${auditResult.count} entradas de auditoría`)

        // 4. Eliminar usuarios que NO sean admin
        const usuariosResult = await prisma.user.deleteMany({
            where: {
                role: 'USER'
            }
        })
        console.log(`✅ Eliminados ${usuariosResult.count} usuarios (no admin)`)

        // 5. Verificar que queda el admin
        const admins = await prisma.user.findMany({
            where: { role: 'ADMIN' }
        })
        console.log(`✅ Usuarios admin restantes: ${admins.length}`)
        admins.forEach(admin => {
            console.log(`   - ${admin.name} (${admin.email})`)
        })

        console.log('\n✨ Base de datos limpiada exitosamente!')
        console.log('📊 Estado actual:')
        console.log(`   - Libros: 0`)
        console.log(`   - Préstamos: 0`)
        console.log(`   - Usuarios admin: ${admins.length}`)

    } catch (error) {
        console.error('❌ Error al limpiar:', error)
        throw error
    } finally {
        await prisma.$disconnect()
    }
}

limpiar()
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
