@echo off
title Sistema de Biblioteca
cd /d "%~dp0"

echo ==========================================
echo      SISTEMA DE GESTION DE BIBLIOTECA
echo ==========================================
echo.
echo Iniciando servicios...

:: Verificar si existe el archivo de build válido
if not exist ".next\BUILD_ID" (
    echo [AVISO] No se encontro una version construida del sistema.
    echo Construyendo aplicacion ahora (esto puede tardar unos minutos)...
    echo.
    call npm run build
    
    if %errorlevel% neq 0 (
        echo.
        echo [ERROR] Fallo la construccion del sistema.
        echo Por favor, ejecute "Instalar_Inicial.bat" para ver mas detalles.
        pause
        exit /b
    )
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
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] El servidor se cerro inesperadamente.
    echo Si ve un error "Could not find a production build", ejecute "Instalar_Inicial.bat".
    pause
)
pause
