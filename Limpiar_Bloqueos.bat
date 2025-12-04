@echo off
title Limpiar Bloqueos y Procesos
cd /d "%~dp0"

echo ==========================================
echo      HERRAMIENTA DE LIMPIEZA DE BLOQUEOS
echo ==========================================
echo.
echo Este script detendra todos los procesos de Node.js que puedan
echo estar bloqueando archivos y causando el error EPERM (-4048).
echo.
echo [ADVERTENCIA] Esto cerrara cualquier servidor o terminal de Node abierta.
echo.
pause

echo.
echo 1. Deteniendo procesos de Node.js...
taskkill /F /IM node.exe /T >nul 2>&1
if %errorlevel% equ 0 (
    echo    - Procesos detenidos correctamente.
) else (
    echo    - No se encontraron procesos activos (esto es bueno).
)

echo.
echo 2. Intentando limpiar carpetas temporales...
if exist ".next" (
    echo    - Eliminando carpeta .next...
    rmdir /s /q ".next" >nul 2>&1
)

echo.
echo ==========================================
echo      LISTO PARA REINTENTAR
echo ==========================================
echo.
echo Ahora, por favor siga estos pasos EXACTOS:
echo.
echo 1. Si usa OneDrive, PAUSE LA SINCRONIZACION temporalmente.
echo    (OneDrive suele bloquear archivos mientras se instalan).
echo.
echo 2. Ejecute "Instalar_Inicial.bat" nuevamente.
echo.
pause
