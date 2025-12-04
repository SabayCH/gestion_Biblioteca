# 📚 Sistema de Gestión de Biblioteca

Sistema moderno de gestión de biblioteca desarrollado con Next.js 14, TypeScript, Prisma y SQLite.

## ✨ Características

- 🔐 **Autenticación de usuarios** con roles (Admin/Usuario)
- 📖 **Gestión de inventario** de libros con paginación y búsqueda
- 📋 **Sistema de préstamos** con seguimiento de fechas y estados
- 👥 **Administración de usuarios**
- 📊 **Dashboard con estadísticas** en tiempo real
- � **Importación y Exportación** de datos (Excel y PDF)
- 📅 **Reportes Avanzados** por rango de fechas
- �🔍 **Búsqueda y filtrado** avanzado
- 📝 **Registro de auditoría** de acciones

## 🚀 Inicio Rápido (Windows)

Hemos simplificado la instalación con scripts automáticos.

### 1. Instalación Inicial
Si es la primera vez que descargas el proyecto en esta PC:
1.  Ejecuta el archivo `Instalar_Inicial.bat`.
2.  Este script instalará las dependencias, configurará la base de datos y creará el usuario administrador.

### 2. Iniciar el Sistema
Para usar el sistema diariamente:
1.  Ejecuta el archivo `Iniciar_Sistema.bat`.
2.  El sistema verificará si necesita construirse y abrirá automáticamente el navegador.

---

## ⚙️ Instalación Manual (Desarrolladores)

Si prefieres usar la terminal:

1. **Instalar dependencias**
```bash
npm install
```

2. **Configurar base de datos**
```bash
npx prisma migrate deploy
npx prisma db seed
```

3. **Construir y ejecutar**
```bash
npm run build
npm start
```

## 👤 Cuentas por Defecto

### Admin
- **Email:** admin@biblioteca.com
- **Contraseña:** admin123

> **Nota:** El script de instalación solo crea este usuario administrador. Puedes crear más usuarios desde el panel de administración.

## Scripts Disponibles

```bash
npm run dev          # Inicia el servidor de desarrollo
npm run build        # Compila para producción
npm start            # Inicia el servidor de producción
npm run db:push      # Sincroniza el esquema de Prisma con la BD
npm run db:seed      # Pobla la BD con datos iniciales
npm run db:studio    # Abre Prisma Studio (GUI para la BD)
```

## Estructura del Proyecto

```
├── app/                    # App Router de Next.js
│   ├── api/               # API Routes (Server Actions preferidos)
│   ├── dashboard/         # Páginas del sistema
│   └── login/             # Página de acceso
├── components/             # Componentes reutilizables (UI, Exportación, Tablas)
├── lib/                    # Utilidades, Server Actions y configuración
├── prisma/                 # Configuración de BD y Esquema
└── public/                 # Archivos estáticos
```

## Modelo de Datos

### Usuario (User)
- Roles: ADMIN (Control total), USER (Operador de préstamos)

### Libro
- Campos: Título, Autor, Código, Sig. Topográfica, Edición, Cantidad
- Control automático de disponibilidad

### Préstamo
- Estados: ACTIVO, DEVUELTO
- Fechas: Préstamo, Límite, Devolución
- Relación con Libro y Operador

## 🎨 Tecnologías

- **Frontend:** Next.js 14, React 18, TailwindCSS
- **Backend:** Server Actions, NextAuth.js
- **Base de Datos:** SQLite con Prisma ORM
- **Exportación:** xlsx (Excel), jsPDF (PDF)
- **Validación:** Zod
- **UI:** Sonner (Toasts), Heroicons

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.
