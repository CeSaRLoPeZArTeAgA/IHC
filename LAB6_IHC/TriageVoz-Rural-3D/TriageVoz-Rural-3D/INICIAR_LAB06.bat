@echo off
cd /d "%~dp0"

echo ==============================================
echo   TriageVoz Rural 3D - CC451 LAB06
echo ==============================================

where node >nul 2>nul
if errorlevel 1 (
  echo ERROR: Node.js no esta instalado o no esta en PATH.
  echo Instala Node.js y vuelve a ejecutar este archivo.
  pause
  exit /b 1
)

if not exist node_modules (
  echo Instalando dependencias por primera vez...
  call npm install
  if errorlevel 1 (
    echo ERROR: npm install fallo. Revisa tu conexion a Internet.
    pause
    exit /b 1
  )
)

echo.
echo Iniciando servidor local Vite...
echo Cuando aparezca Local: http://localhost:5173/ abre esa direccion.
echo.
call npm run dev
