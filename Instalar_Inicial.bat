@echo off
title Instalacion Inicial - Sistema de Biblioteca
cd /d "%~dp0"

echo ==========================================
echo      INSTALACION INICIAL DEL SISTEMA
echo ==========================================
echo.
echo IMPORTANTE: Por favor, CIERRE cualquier otra ventana negra (terminal)
echo que este ejecutando el sistema antes de continuar.
echo.
echo Directorio actual: %cd%
echo.
echo Este script preparara el sistema para su primer uso.
echo Asegurese de tener internet para descargar las librerias.
echo.

:: Verificar Node.js
echo Verificando instalacion de Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js no esta instalado o no se encuentra en el PATH.
    echo Por favor, instale Node.js LTS desde https://nodejs.org/
    echo.
    pause
    exit /b
)

echo.
echo 1. Instalando dependencias (esto puede tardar)...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Fallo la instalacion de dependencias.
    pause
    exit /b
)

echo.
echo 2. Configurando base de datos...
:: Copiar .env si no existe
if not exist ".env" (
    echo Creando archivo de configuracion .env...
    copy .env.example .env
)

echo Ejecutando migraciones...
call npx prisma migrate deploy
if %errorlevel% neq 0 (
    echo [ERROR] Fallo la configuracion de la base de datos (migraciones).
    pause
    exit /b
)

echo.
echo 3. Construyendo la aplicacion (esto puede tardar unos minutos)...
:: Limpiar cache de build anterior
if exist ".next" (
    echo Limpiando archivos temporales anteriores...
    rmdir /s /q ".next"
)

call npm run build
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Fallo la construccion de la aplicacion.
    echo.
    echo Posibles causas:
    echo 1. Tiene otra ventana del sistema abierta (Cierrela e intente de nuevo).
    echo 2. La carpeta del proyecto esta corrupta.
    echo.
    echo Detalle del error (Revise arriba):
    pause
    exit /b
)

echo.
echo 4. Creando usuario administrador por defecto...
call npx prisma db seed
if %errorlevel% neq 0 (
    echo [ADVERTENCIA] Hubo un problema al crear el usuario por defecto.
    echo Es posible que ya exista o haya un error de configuracion.
)

echo.
echo ==========================================
echo      INSTALACION COMPLETADA
echo ==========================================
echo.
echo Todo listo! Ahora puede usar el archivo "Iniciar_Sistema.bat" para abrir el programa.
pause
