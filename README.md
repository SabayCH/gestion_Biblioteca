# Sistema de Gestión de Biblioteca

Sistema especializado para gestión de biblioteca desarrollado con Next.js 14, React, TypeScript, Prisma y NextAuth.js.

## 🚀 Características

- ✅ **Autenticación segura**: Sistema de login con NextAuth.js
- ✅ **Gestión de usuarios**: Inicio con admin, escalable para múltiples usuarios
- ✅ **Inventario de libros**: CRUD completo para gestión de existencias
- ✅ **Sistema de préstamos**: Registro y seguimiento de préstamos con fechas
- ✅ **Dashboard**: Vista general con estadísticas del sistema
- ✅ **Interfaz moderna**: Diseño responsivo con Tailwind CSS

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o yarn

## 🔧 Instalación

1. **Clonar el repositorio** (o usar este directorio)

2. **Instalar dependencias:**
```bash
npm install
```

3. **Configurar variables de entorno:**

Crea un archivo `.env` en la raíz del proyecto:
```env
# Base de datos
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu-secret-key-super-segura-aqui-genera-una-con-openssl

# Credenciales del administrador inicial (opcional)
ADMIN_EMAIL=admin@biblioteca.com
ADMIN_PASSWORD=admin123
```

**Para generar NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

4. **Configurar la base de datos:**
```bash
# Generar cliente Prisma
npm run db:generate

# Crear la base de datos y tablas
npm run db:push

# (Opcional) Crear migraciones
npm run db:migrate

# Poblar con datos iniciales (crea usuario admin y libros de ejemplo)
npm run db:seed
```

5. **Iniciar el servidor de desarrollo:**
```bash
npm run dev
```

6. **Abrir en el navegador:**
```
http://localhost:3000
```

## 👤 Credenciales por Defecto

Después de ejecutar el seed, puedes iniciar sesión con:

- **Email:** admin@biblioteca.com
- **Contraseña:** admin123

*Nota: Cambia estas credenciales en producción*

## 📁 Estructura del Proyecto

```
├── app/                      # App Router de Next.js
│   ├── api/                  # API Routes
│   │   ├── auth/             # NextAuth endpoints
│   │   ├── libros/           # API de libros
│   │   ├── prestamos/        # API de préstamos
│   │   └── usuarios/         # API de usuarios
│   ├── dashboard/            # Páginas del dashboard
│   │   ├── inventario/       # Gestión de inventario
│   │   ├── prestamos/        # Gestión de préstamos
│   │   └── usuarios/         # Gestión de usuarios
│   ├── login/                # Página de login
│   └── layout.tsx            # Layout principal
├── components/               # Componentes React reutilizables
├── lib/                      # Utilidades y configuraciones
│   ├── auth.ts               # Configuración NextAuth
│   └── prisma.ts             # Cliente Prisma
├── prisma/                   # Schema y migraciones de Prisma
│   ├── schema.prisma         # Schema de la base de datos
│   └── seed.ts               # Script de seed
└── types/                    # Definiciones de TypeScript
```

## 🗄️ Modelos de Datos

### User (Usuario)
- `id`: Identificador único
- `email`: Email único del usuario
- `name`: Nombre completo
- `password`: Contraseña hasheada
- `role`: Rol (ADMIN o USER)

### Libro
- `id`: Identificador único
- `titulo`: Título del libro
- `autor`: Autor del libro
- `isbn`: ISBN (opcional, único)
- `editorial`: Editorial
- `anio`: Año de publicación
- `categoria`: Categoría del libro
- `descripcion`: Descripción
- `cantidad`: Cantidad total
- `disponible`: Cantidad disponible

### Prestamo
- `id`: Identificador único
- `libroId`: ID del libro prestado
- `userId`: ID del usuario que solicita
- `fechaPrestamo`: Fecha de préstamo
- `fechaDevolucion`: Fecha de devolución (null si activo)
- `fechaLimite`: Fecha límite de devolución
- `estado`: ACTIVO, DEVUELTO, VENCIDO
- `observaciones`: Notas adicionales

## 📝 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Iniciar servidor de desarrollo

# Producción
npm run build            # Construir para producción
npm start                # Iniciar servidor de producción

# Base de datos
npm run db:generate      # Generar cliente Prisma
npm run db:push          # Sincronizar schema con BD (desarrollo)
npm run db:migrate       # Crear migración
npm run db:seed          # Poblar datos iniciales
npm run db:studio        # Abrir Prisma Studio (GUI de BD)

# Linting
npm run lint             # Ejecutar ESLint
```

## 🔒 Seguridad

- Las contraseñas se hashean con bcryptjs
- Las rutas del dashboard requieren autenticación
- Las APIs están protegidas con verificación de sesión
- Variables sensibles en archivos `.env`

## 🚀 Próximos Pasos

1. **Mejoras sugeridas:**
   - Búsqueda avanzada de libros
   - Filtros por categoría, autor, etc.
   - Exportar reportes a PDF/Excel
   - Notificaciones de préstamos vencidos
   - Historial completo de préstamos por usuario/libro
   - Código de barras para libros
   - Reservas de libros

2. **Escalabilidad:**
   - Cambiar a PostgreSQL para producción
   - Implementar paginación en listados
   - Cache con Redis (opcional)
   - Sistema de logs

## 📚 Tecnologías Utilizadas

- **Next.js 14**: Framework React con App Router
- **React 18**: Biblioteca UI
- **TypeScript**: Tipado estático
- **Prisma**: ORM para base de datos
- **NextAuth.js**: Autenticación
- **Tailwind CSS**: Estilos
- **bcryptjs**: Hash de contraseñas
- **date-fns**: Manejo de fechas
- **SQLite**: Base de datos (fácil cambio a PostgreSQL)

## 🐛 Solución de Problemas

**Error de conexión a la base de datos:**
- Asegúrate de haber ejecutado `npm run db:push`
- Verifica que el archivo `.env` tenga `DATABASE_URL` correcto

**Error de autenticación:**
- Verifica que `NEXTAUTH_SECRET` esté configurado
- Asegúrate de haber ejecutado el seed para crear el usuario admin

**Error al crear usuario:**
- Verifica que el email no esté duplicado
- Asegúrate de que la contraseña tenga al menos 6 caracteres

## 📄 Licencia

Este proyecto es de uso libre para fines educativos y comerciales.

## 👨‍💻 Desarrollo

Para contribuir o hacer modificaciones:

1. Crea una rama para tu feature
2. Realiza tus cambios
3. Prueba localmente
4. Crea un pull request

---

**Desarrollado con ❤️ usando Next.js y React**
