@echo off
title Sistema de Biblioteca
echo ==========================================
echo      SISTEMA DE GESTION DE BIBLIOTECA
echo ==========================================
echo.
echo Iniciando servicios...

:: Cambiar al directorio del script
cd /d "%~dp0"

:: Verificar si existe el archivo de build válido
if not exist ".next\BUILD_ID" (
    echo Detectado falta de archivos de construccion.
    echo Construyendo aplicacion (esto puede tardar unos minutos)...
    call npm run build
)

echo.
echo Abriendo navegador...
:: Esperar 3 segundos antes de abrir el navegador
timeout /t 3 >nul
start http://localhost:3000

echo.
echo Iniciando servidor...
echo IMPORTANTE: No cierre esta ventana mientras use el sistema.
echo Para salir, presione Ctrl + C o cierre esta ventana.
echo.

call npm start
pause
