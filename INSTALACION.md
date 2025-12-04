# Guía de Instalación Manual - Sistema de Biblioteca

Esta guía detalla los pasos para instalar y ejecutar el sistema **manualmente** usando la terminal. Este es el método más seguro y recomendado si tienes problemas con los scripts automáticos.

---

## 1. Requisitos Previos

Asegúrate de tener instalado **Node.js** (Versión LTS 18, 20 o superior).
*   Para verificar, abre una terminal (CMD o PowerShell) y escribe: `node -v`
*   Si sale un número de versión (ej. `v20.10.0`), estás listo.

---

## 2. Preparación de la Carpeta

1.  Copia la carpeta del proyecto a tu computadora.
2.  **IMPORTANTE**: Si la carpeta tiene una subcarpeta llamada `node_modules`, **BÓRRALA**.
    *   Esto es vital para evitar conflictos si vienes de otra computadora.
    *   También borra la carpeta `.next` si existe.

---

## 3. Instalación Paso a Paso (Terminal)

Abre una terminal (CMD o PowerShell) **dentro de la carpeta del proyecto**.
*(Truco: Entra a la carpeta, escribe `cmd` en la barra de dirección de arriba y presiona Enter)*.

### Paso 1: Instalar Librerías
Escribe este comando y espera a que termine:
```bash
npm install
```
*Si ves advertencias amarillas (warn), ignóralas. Si ves errores rojos (error), revisa tu conexión a internet.*

### Paso 2: Configurar Entorno
1.  Busca el archivo `.env.example`.
2.  Haz una copia y llámala `.env`.
3.  (Opcional) Abre `.env` con el Bloc de Notas. Asegúrate de que `DATABASE_URL` sea `"file:./dev.db"`.

### Paso 3: Configurar Base de Datos
Ejecuta estos dos comandos, uno por uno:

Generar la base de datos:
```bash
npx prisma migrate deploy
```

Crear usuario administrador (admin@biblioteca.com):
```bash
npx prisma db seed
```

### Paso 4: Construir la Aplicación (Build)
Este paso optimiza el sistema para que sea rápido. Puede tardar unos minutos:
```bash
npm run build
```

---

## 4. Ejecutar el Sistema

Una vez completados los pasos anteriores, tienes dos formas de usar el sistema:

### Opción A: Modo Producción (Recomendado para uso diario)
Es más rápido y estable.
```bash
npm start
```
*   Luego abre tu navegador en: `http://localhost:3000`

### Opción B: Modo Desarrollo (Para pruebas)
Si quieres hacer cambios en el código.
```bash
npm run dev
```

---

## 5. Solución de Problemas Comunes

### Error de Permisos (EPERM / -4048)
Si te sale un error que dice "operation not permitted" o "EPERM":
1.  Cierra **todas** las terminales abiertas.
2.  Si usas **OneDrive**, pausa la sincronización o mueve la carpeta fuera de OneDrive (ej. a `C:\Proyectos`).
3.  Vuelve a intentar el comando que falló.

### Error de Red (ECONNRESET)
Si falla el `npm install`:
1.  Ejecuta: `npm cache clean --force`
2.  Intenta de nuevo: `npm install`

### Error "Build not found"
Si al ejecutar `npm start` te dice que no encuentra el build:
1.  Significa que saltaste el Paso 4.
2.  Ejecuta `npm run build` y espera a que termine.
