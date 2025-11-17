# 🚀 Instrucciones para Probar el Proyecto

## Paso 1: Instalar Dependencias
```bash
npm install
```

## Paso 2: Generar Cliente Prisma
```bash
npm run db:generate
```

## Paso 3: Crear Base de Datos
```bash
npm run db:push
```

## Paso 4: Poblar con Datos Iniciales
```bash
npm run db:seed
```

## Paso 5: Iniciar Servidor de Desarrollo
```bash
npm run dev
```

## Paso 6: Abrir en el Navegador
Abre tu navegador en: **http://localhost:3000**

## 🔑 Credenciales de Acceso
- **Email:** admin@biblioteca.com
- **Contraseña:** admin123

---

## ⚠️ Si tienes problemas:

### Error: "NEXTAUTH_SECRET no está configurado"
Genera una nueva clave secreta:
```bash
openssl rand -base64 32
```
Y actualiza el archivo `.env` con el valor generado.

### Error: "Cannot find module"
Ejecuta nuevamente:
```bash
npm install
```

### Error de base de datos
Asegúrate de haber ejecutado:
```bash
npm run db:generate
npm run db:push
npm run db:seed
```

