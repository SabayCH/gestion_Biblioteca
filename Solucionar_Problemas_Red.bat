@echo off
title Solucionar Problemas de Red (NPM)
cd /d "%~dp0"

echo ==========================================
echo      SOLUCIONADOR DE PROBLEMAS DE RED
echo ==========================================
echo.
echo Este script intentara arreglar problemas comunes de conexion con NPM.
echo Util para errores como ECONNRESET, ETIMEDOUT, o fetch failed.
echo.
echo Pasos que se realizaran:
echo 1. Limpiar cache de NPM
echo 2. Configurar registro oficial
echo 3. Aumentar tiempos de espera (timeouts)
echo 4. Desactivar strict-ssl (temporalmente)
echo.
pause

echo.
echo 1. Limpiando cache...
call npm cache clean --force

echo.
echo 2. Configurando registro...
call npm config set registry https://registry.npmjs.org/

echo.
echo 3. Aumentando timeouts...
call npm config set fetch-retry-maxtimeout 600000
call npm config set fetch-retry-mintimeout 10000
call npm config set fetch-retries 5

echo.
echo 4. Ajustando SSL (opcional)...
call npm config set strict-ssl false

echo.
echo ==========================================
echo      CONFIGURACION TERMINADA
echo ==========================================
echo.
echo Por favor, intente ejecutar "Instalar_Inicial.bat" nuevamente.
echo.
pause
