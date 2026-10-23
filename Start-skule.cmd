@echo off
setlocal
cd /d "%~dp0"
if exist "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" set "PATH=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin;%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback;%PATH%"
call pnpm install --frozen-lockfile
if errorlevel 1 goto failed
node scripts/setup.mjs
if errorlevel 1 goto failed
echo.
echo Opne http://127.0.0.1:5175 i Chrome naar serveren er klar.
echo Hald dette vindauget ope. Trykk Ctrl+C for aa avslutte.
call pnpm dev
goto end
:failed
echo Oppstart feila. Sjå feilmeldinga ovanfor. Ingen elevdata er sletta.
:end
pause
