@echo off
REM NERVE AGENT Pre-Push Validation Script
REM Run this before pushing to prevent Vercel build failures

echo ===================================
echo NERVE AGENT - Pre-Push Validation
echo ===================================
echo.

cd /d "%~dp0..\apps\web"

echo [1/2] TypeScript Check...
call npx tsc --noEmit
if %ERRORLEVEL% NEQ 0 (
    echo   TypeScript: FAILED
    exit /b 1
)
echo   TypeScript: OK
echo.

echo [2/2] Production Build...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo   Build: FAILED
    exit /b 1
)
echo   Build: OK
echo.

echo ===================================
echo All validations passed!
echo Safe to push.
echo ===================================
