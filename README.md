# 📚 Sistema de Gestión de Biblioteca

Sistema moderno de gestión de biblioteca desarrollado con Next.js 14, TypeScript, Prisma y SQLite.

## ✨ Características

- 🔐 **Autenticación de usuarios** con roles (Admin/Usuario)
- 📖 **Gestión de inventario** de libros
- 📋 **Sistema de préstamos** con seguimiento de fechas
- 👥 **Administración de usuarios**
- 📊 **Dashboard con estadísticas** en tiempo real
- 🔍 **Búsqueda y filtrado** avanzado
- 📝 **Registro de auditoría** de acciones

## 🚀 Inicio Rápido

### Requisitos Previos

- Node.js 18+ instalado
- npm o pnpm

### Instalación

1. **Clonar el repositorio**
```bash
git clone <repo-url>
cd gestorDocumentos
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
```

4. **Inicializar la base de datos**
```bash
npm run db:push
npm run db:seed
```

5. **Iniciar el servidor de desarrollo**
```bash
npm run dev
```

6. **Abrir en el navegador**
```
http://localhost:3000
```

## 👤 Cuentas de Demo

### Admin
- **Email:** admin@biblioteca.com
- **Contraseña:** admin123

### Usuarios
- **Email:** operador1@biblioteca.com | **Contraseña:** 123456
- **Email:** operador2@biblioteca.com | **Contraseña:** 123456
- **Email:** supervisor@biblioteca.com | **Contraseña:** supervisor123

## 🛠️ Scripts Disponibles

```bash
npm run dev          # Inicia el servidor de desarrollo
npm run build        # Compila para producción
npm run start        # Inicia el servidor de producción
npm run db:push      # Sincroniza el esquema de Prisma con la BD
npm run db:seed      # Pobla la BD con datos de prueba
npm run db:studio    # Abre Prisma Studio (GUI para la BD)
```

## 📁 Estructura del Proyecto

```
├── app/                    # App Router de Next.js
│   ├── api/               # API Routes
│   │   ├── auth/         # Autenticación
│   │   ├── libros/       # CRUD de libros
│   │   ├── prestamos/    # CRUD de préstamos
│   │   └── usuarios/     # CRUD de usuarios
│   ├── dashboard/        # Páginas del dashboard
│   ├── login/           # Página de login
│   └── globals.css      # Estilos globales
├── components/           # Componentes reutilizables
├── lib/                 # Utilidades y configuración
├── prisma/              # Configuración de Prisma
│   ├── schema.prisma   # Esquema de la BD
│   └── seed.js         # Datos de prueba
└── types/              # Tipos de TypeScript
```

## 🗄️ Modelo de Datos

### Usuario (User)
- Autenticación y autorización
- Roles: ADMIN, USER
- Relación con préstamos y logs de auditoría

### Libro
- Información completa del libro
- Control de inventario (cantidad/disponible)
- Campos opcionales para flexibilidad

### Préstamo
- Gestión completa del ciclo de préstamo
- Estados: ACTIVO, DEVUELTO, VENCIDO
- Relación con libro y operador

### Log de Auditoría
- Registro de todas las acciones importantes
- Trazabilidad completa del sistema

## 🎨 Tecnologías

- **Frontend:** Next.js 14, React 18, TailwindCSS
- **Backend:** Next.js API Routes, NextAuth.js
- **Base de Datos:** SQLite con Prisma ORM
- **Validación:** Zod
- **Autenticación:** NextAuth.js con bcrypt

## 📝 Notas

- La BD SQLite está en `prisma/dev.db`
- Los datos de semilla incluyen 15 libros y 13 préstamos de ejemplo
- El sistema valida usuarios morosos (no permite préstamos si tienen libros pendientes)
- Los administradores tienen acceso completo, los usuarios solo pueden operar préstamos

## 🔒 Seguridad

- Contraseñas hasheadas con bcrypt
- Autenticación por sesión con NextAuth
- Validación en frontend y backend
- Control de acceso basado en roles

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.
