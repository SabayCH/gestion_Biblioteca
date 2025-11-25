const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Iniciando seed de la base de datos...')

    // Limpiar datos existentes (opcional)
    await prisma.auditLog.deleteMany()
    await prisma.prestamo.deleteMany()
    await prisma.libro.deleteMany()
    await prisma.user.deleteMany()

    console.log('✅ Datos anteriores eliminados')

    // ========================================
    // CREAR USUARIOS
    // ========================================
    const usuarios = [
        {
            email: 'admin@biblioteca.com',
            name: 'Administrador Principal',
            password: await bcrypt.hash('admin123', 10),
            role: 'ADMIN',
        },
        {
            email: 'operador1@biblioteca.com',
            name: 'María López',
            password: await bcrypt.hash('123456', 10),
            role: 'USER',
        },
        {
            email: 'operador2@biblioteca.com',
            name: 'Carlos Ramírez',
            password: await bcrypt.hash('123456', 10),
            role: 'USER',
        },
        {
            email: 'supervisor@biblioteca.com',
            name: 'Ana Silva',
            password: await bcrypt.hash('supervisor123', 10),
            role: 'ADMIN',
        },
    ]

    const usuariosCreados = []
    for (const userData of usuarios) {
        const user = await prisma.user.create({ data: userData })
        usuariosCreados.push(user)
    }

    const [admin, operador1, operador2, supervisor] = usuariosCreados

    console.log(`✅ ${usuariosCreados.length} usuarios creados`)

    // ========================================
    // CREAR LIBROS
    // ========================================
    const libros = [
        {
            numero: 1,
            fechaRegistro: new Date('2024-01-15'),
            numeroRegistro: 'REG-2024-001',
            titulo: 'Cien Años de Soledad',
            autor: 'Gabriel García Márquez',
            cantidad: 3,
            disponible: 1,
        },
        {
            numero: 2,
            fechaRegistro: new Date('2024-01-20'),
            numeroRegistro: 'REG-2024-002',
            titulo: 'Don Quijote de la Mancha',
            autor: 'Miguel de Cervantes',
            cantidad: 2,
            disponible: 2,
        },
        {
            numero: 3,
            fechaRegistro: new Date('2024-02-05'),
            numeroRegistro: 'REG-2024-003',
            titulo: '1984',
            autor: 'George Orwell',
            cantidad: 4,
            disponible: 3,
        },
        {
            numero: 4,
            fechaRegistro: new Date('2024-02-10'),
            numeroRegistro: 'REG-2024-004',
            titulo: 'El Principito',
            autor: 'Antoine de Saint-Exupéry',
            cantidad: 5,
            disponible: 5,
        },
        {
            numero: 5,
            fechaRegistro: new Date('2024-02-15'),
            numeroRegistro: null,
            titulo: 'Rayuela',
            autor: 'Julio Cortázar',
            cantidad: 2,
            disponible: 0,
        },
        {
            numero: 6,
            fechaRegistro: null,
            numeroRegistro: 'REG-2024-006',
            titulo: 'La Odisea',
            autor: 'Homero',
            cantidad: 3,
            disponible: 3,
        },
        {
            numero: 7,
            fechaRegistro: new Date('2024-03-01'),
            numeroRegistro: null,
            titulo: 'Crimen y Castigo',
            autor: 'Fiódor Dostoyevski',
            cantidad: 2,
            disponible: 1,
        },
        {
            numero: 8,
            fechaRegistro: new Date('2024-03-10'),
            numeroRegistro: 'REG-2024-008',
            titulo: 'El Amor en los Tiempos del Cólera',
            autor: 'Gabriel García Márquez',
            cantidad: 3,
            disponible: 2,
        },
        {
            numero: 9,
            fechaRegistro: null,
            numeroRegistro: null,
            titulo: 'Ficciones',
            autor: 'Jorge Luis Borges',
            cantidad: 4,
            disponible: 4,
        },
        {
            numero: 10,
            fechaRegistro: new Date('2024-03-20'),
            numeroRegistro: 'REG-2024-010',
            titulo: 'La Casa de los Espíritus',
            autor: 'Isabel Allende',
            cantidad: 2,
            disponible: 2,
        },
        {
            numero: 11,
            fechaRegistro: new Date('2024-04-05'),
            numeroRegistro: 'REG-2024-011',
            titulo: 'El Túnel',
            autor: 'Ernesto Sabato',
            cantidad: 3,
            disponible: 2,
        },
        {
            numero: 12,
            fechaRegistro: new Date('2024-04-15'),
            numeroRegistro: 'REG-2024-012',
            titulo: 'Pedro Páramo',
            autor: 'Juan Rulfo',
            cantidad: 2,
            disponible: 1,
        },
        {
            numero: 13,
            fechaRegistro: null,
            numeroRegistro: null,
            titulo: 'La Metamorfosis',
            autor: 'Franz Kafka',
            cantidad: 6,
            disponible: 6,
        },
        {
            numero: 14,
            fechaRegistro: new Date('2024-05-10'),
            numeroRegistro: 'REG-2024-014',
            titulo: 'Fahrenheit 451',
            autor: 'Ray Bradbury',
            cantidad: 3,
            disponible: 2,
        },
        {
            numero: 15,
            fechaRegistro: new Date('2024-06-01'),
            numeroRegistro: 'REG-2024-015',
            titulo: 'El Aleph',
            autor: 'Jorge Luis Borges',
            cantidad: 4,
            disponible: 4,
        },
    ]

    const librosCreados = []
    for (const libroData of libros) {
        const libro = await prisma.libro.create({
            data: libroData,
        })
        librosCreados.push(libro)
    }

    console.log(`✅ ${librosCreados.length} libros creados`)

    // ========================================
    // CREAR PRÉSTAMOS
    // ========================================
    const prestamos = [
        // PRÉSTAMOS ACTIVOS
        {
            libroId: librosCreados[0].id, // Cien Años de Soledad
            usuarioId: admin.id,
            nombrePrestatario: 'Juan Pérez',
            dni: '12345678',
            email: 'juan.perez@example.com',
            fechaPrestamo: new Date('2024-11-01'),
            fechaLimite: new Date('2024-12-15'),
            estado: 'ACTIVO',
        },
        {
            libroId: librosCreados[0].id, // Cien Años de Soledad (2do ejemplar)
            usuarioId: operador1.id,
            nombrePrestatario: 'Sofía Martínez',
            dni: '23456789',
            email: 'sofia.martinez@example.com',
            fechaPrestamo: new Date('2024-11-15'),
            fechaLimite: new Date('2024-12-29'),
            estado: 'ACTIVO',
        },
        {
            libroId: librosCreados[2].id, // 1984
            usuarioId: operador2.id,
            nombrePrestatario: 'María González',
            dni: '87654321',
            email: 'maria.gonzalez@example.com',
            fechaPrestamo: new Date('2024-11-05'),
            fechaLimite: new Date('2024-12-19'),
            estado: 'ACTIVO',
        },
        {
            libroId: librosCreados[4].id, // Rayuela (1er ejemplar)
            usuarioId: supervisor.id,
            nombrePrestatario: 'Pablo Torres',
            dni: '34567890',
            email: 'pablo.torres@example.com',
            fechaPrestamo: new Date('2024-11-08'),
            fechaLimite: new Date('2024-12-22'),
            estado: 'ACTIVO',
        },
        {
            libroId: librosCreados[4].id, // Rayuela (2do ejemplar)
            usuarioId: admin.id,
            nombrePrestatario: 'Laura Díaz',
            dni: '45678901',
            email: 'laura.diaz@example.com',
            fechaPrestamo: new Date('2024-11-12'),
            fechaLimite: new Date('2024-12-26'),
            estado: 'ACTIVO',
        },
        {
            libroId: librosCreados[7].id, // El Amor en los Tiempos del Cólera
            usuarioId: operador1.id,
            nombrePrestatario: 'Ana Martínez',
            dni: '55667788',
            email: 'ana.martinez@example.com',
            fechaPrestamo: new Date('2024-11-10'),
            fechaLimite: new Date('2024-12-24'),
            estado: 'ACTIVO',
        },
        {
            libroId: librosCreados[6].id, // Crimen y Castigo
            usuarioId: operador2.id,
            nombrePrestatario: 'Diego Ruiz',
            dni: '56789012',
            email: 'diego.ruiz@example.com',
            fechaPrestamo: new Date('2024-11-18'),
            fechaLimite: new Date('2024-12-30'),
            estado: 'ACTIVO',
        },
        {
            libroId: librosCreados[10].id, // El Túnel
            usuarioId: supervisor.id,
            nombrePrestatario: 'Valentina Castro',
            dni: '67890123',
            email: 'valentina.castro@example.com',
            fechaPrestamo: new Date('2024-11-20'),
            fechaLimite: new Date('2025-01-03'),
            estado: 'ACTIVO',
        },
        {
            libroId: librosCreados[11].id, // Pedro Páramo
            usuarioId: admin.id,
            nombrePrestatario: 'Rodrigo Vega',
            dni: '78901234',
            email: 'rodrigo.vega@example.com',
            fechaPrestamo: new Date('2024-11-22'),
            fechaLimite: new Date('2025-01-05'),
            estado: 'ACTIVO',
        },
        {
            libroId: librosCreados[13].id, // Fahrenheit 451
            usuarioId: operador1.id,
            nombrePrestatario: 'Camila Morales',
            dni: '89012345',
            email: 'camila.morales@example.com',
            fechaPrestamo: new Date('2024-11-23'),
            fechaLimite: new Date('2025-01-06'),
            estado: 'ACTIVO',
        },

        // PRÉSTAMOS DEVUELTOS
        {
            libroId: librosCreados[1].id, // Don Quijote
            usuarioId: admin.id,
            nombrePrestatario: 'Carlos Rodríguez',
            dni: '11223344',
            email: 'carlos.rodriguez@example.com',
            fechaPrestamo: new Date('2024-10-20'),
            fechaLimite: new Date('2024-11-03'),
            fechaDevolucion: new Date('2024-11-02'),
            estado: 'DEVUELTO',
        },
        {
            libroId: librosCreados[3].id, // El Principito
            usuarioId: operador2.id,
            nombrePrestatario: 'Luis Fernández',
            dni: '99887766',
            email: 'luis.fernandez@example.com',
            fechaPrestamo: new Date('2024-10-10'),
            fechaLimite: new Date('2024-10-24'),
            fechaDevolucion: new Date('2024-10-23'),
            estado: 'DEVUELTO',
        },
        {
            libroId: librosCreados[8].id, // Ficciones
            usuarioId: supervisor.id,
            nombrePrestatario: 'Gabriela Sánchez',
            dni: '22334455',
            email: 'gabriela.sanchez@example.com',
            fechaPrestamo: new Date('2024-09-15'),
            fechaLimite: new Date('2024-09-29'),
            fechaDevolucion: new Date('2024-09-28'),
            estado: 'DEVUELTO',
        },
    ]

    for (const prestamoData of prestamos) {
        await prisma.prestamo.create({
            data: prestamoData,
        })
    }

    console.log(`✅ ${prestamos.length} préstamos creados`)

    // ========================================
    // CREAR LOGS DE AUDITORÍA
    // ========================================
    const auditLogs = [
        {
            action: 'CREAR',
            entity: 'Libro',
            entityId: librosCreados[0].id,
            usuarioId: admin.id,
            detalles: 'Libro "Cien Años de Soledad" agregado al inventario',
        },
        {
            action: 'CREAR',
            entity: 'User',
            entityId: operador1.id,
            usuarioId: admin.id,
            detalles: 'Usuario "María López" creado',
        },
        {
            action: 'PRESTAR',
            entity: 'Prestamo',
            usuarioId: admin.id,
            detalles: 'Préstamo registrado para Juan Pérez',
        },
        {
            action: 'DEVOLVER',
            entity: 'Prestamo',
            usuarioId: admin.id,
            detalles: 'Libro "Don Quijote de la Mancha" devuelto por Carlos Rodríguez',
        },
    ]

    for (const logData of auditLogs) {
        await prisma.auditLog.create({ data: logData })
    }

    console.log(`✅ ${auditLogs.length} logs de auditoría creados`)

    console.log('\n🎉 Seed completado exitosamente!')
    console.log('\n📊 Resumen:')
    console.log(`   - Usuarios: ${usuariosCreados.length}`)
    console.log(`     • admin@biblioteca.com / admin123 (ADMIN)`)
    console.log(`     • operador1@biblioteca.com / 123456 (USER)`)
    console.log(`     • operador2@biblioteca.com / 123456 (USER)`)
    console.log(`     • supervisor@biblioteca.com / supervisor123 (ADMIN)`)
    console.log(`   - Libros: ${librosCreados.length}`)
    console.log(`   - Préstamos: ${prestamos.length} (10 activos, 3 devueltos)`)
    console.log(`   - Logs de auditoría: ${auditLogs.length}`)
}

main()
    .catch((e) => {
        console.error('❌ Error durante el seed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
