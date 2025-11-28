@echo off
title Instalacion Inicial - Sistema de Biblioteca
echo ==========================================
echo      INSTALACION INICIAL DEL SISTEMA
echo ==========================================
echo.
echo Este script preparara el sistema para su primer uso.
echo Asegurese de tener internet para descargar las librerias.
echo.
pause

echo.
echo 1. Instalando dependencias (esto puede tardar)...
cd /d "%~dp0"
call npm install

echo.
echo 2. Configurando base de datos...
:: Copiar .env si no existe
if not exist ".env" (
    echo Creando archivo de configuracion .env...
    copy .env.example .env
)

call npx prisma migrate deploy

echo.
echo 3. Creando usuario administrador por defecto...
call npx prisma db seed

echo.
echo ==========================================
echo      INSTALACION COMPLETADA
echo ==========================================
echo.
echo Todo listo! Ahora puede usar el archivo "Iniciar_Sistema.bat" para abrir el programa.
pause
