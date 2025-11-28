# Guía de Instalación y Despliegue Local

Esta guía detalla los pasos para instalar y ejecutar el Sistema de Gestión de Biblioteca en una nueva computadora (Windows).

## 1. Requisitos Previos

Antes de empezar, necesitas instalar los siguientes programas en la computadora destino:

1.  **Node.js (Versión LTS)**:
    *   Descarga e instala la versión "LTS" (Long Term Support) desde: [https://nodejs.org/](https://nodejs.org/)
    *   Durante la instalación, asegúrate de marcar todas las casillas predeterminadas.

2.  **Git (Opcional pero recomendado)**:
    *   Descarga desde: [https://git-scm.com/download/win](https://git-scm.com/download/win)
    *   Si no quieres instalar Git, puedes copiar la carpeta del proyecto mediante una memoria USB.

## 2. Copiar el Proyecto

Tienes dos opciones:

*   **Opción A (Con Git)**: Clonar el repositorio.
    ```bash
    git clone https://github.com/SabayCH/gestion_Biblioteca.git
    cd gestion_Biblioteca
    ```

*   **Opción B (Sin Git)**:
    1.  Copia toda la carpeta de tu proyecto actual a una memoria USB.
    2.  Pégala en el Escritorio o Documentos de la nueva computadora.
    3.  **Importante**: No necesitas copiar la carpeta `node_modules` (es muy pesada y se reinstalará).

## 3. Instalación de Dependencias

1.  Abre la terminal (PowerShell o CMD).
2.  Navega hasta la carpeta del proyecto:
    ```bash
    cd ruta\a\tu\carpeta\gestion_Biblioteca
    ```
3.  Ejecuta el comando de instalación:
    ```bash
    npm install
    ```
    *Esto descargará todas las librerías necesarias.*

## 4. Configuración del Entorno

1.  En la carpeta del proyecto, busca el archivo `.env.example`.
2.  Haz una copia de ese archivo y renómbralo a `.env` (sin el .example).
3.  Abre el archivo `.env` con el Bloc de Notas y asegúrate de que tenga este contenido:

    ```env
    DATABASE_URL="file:./dev.db"
    NEXTAUTH_URL="http://localhost:3000"
    NEXTAUTH_SECRET="una_clave_secreta_muy_larga_y_segura_123"
    ```

## 5. Configuración de la Base de Datos

Para crear la base de datos localmente, ejecuta este comando en la terminal:

```bash
npx prisma migrate deploy
```

*Esto creará el archivo `prisma/dev.db` con todas las tablas necesarias.*

(Opcional) Si quieres crear el usuario administrador por defecto:
```bash
npx prisma db seed
```

## 6. Ejecutar la Aplicación

### Opción A: Modo Desarrollo (Más fácil para probar)
Simplemente ejecuta:
```bash
npm run dev
```
La aplicación estará disponible en: `http://localhost:3000`

### Opción B: Modo Producción (Más rápido y estable)
1.  Construye la aplicación (solo se hace una vez o cuando hay cambios):
    ```bash
    npm run build
    ```
2.  Inicia el servidor:
    ```bash
    npm start
    ```

## 7. Crear un Acceso Directo (Alternativa Manual)

Si el archivo `.bat` no te funciona o prefieres hacerlo manualmente:

1.  Haz clic derecho en el Escritorio > **Nuevo** > **Acceso directo**.
2.  En "Escriba la ubicación del elemento", pega lo siguiente (reemplaza `RUTA_DE_TU_CARPETA` por la ruta real):
    ```cmd
    cmd /k "cd /d RUTA_DE_TU_CARPETA && npm start"
    ```
    *Ejemplo: `cmd /k "cd /d C:\Users\Admin\Desktop\gestion_Biblioteca && npm start"`*
3.  Haz clic en **Siguiente**, ponle de nombre "Sistema Biblioteca" y finalizar.

**Nota**: Para que esto funcione, ya debes haber ejecutado `npm run build` al menos una vez en la terminal.
