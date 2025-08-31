@echo off
echo ========================================
echo    The Bible Project - APK Generator
echo ========================================
echo.

REM Build the project
echo [1/4] Building the project...
call npm run build
if %ERRORLEVEL% neq 0 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)

echo [2/4] Build successful!
echo.

REM Start preview server for PWA Builder
echo [3/4] Starting preview server...
start /B npm run preview -- --host
timeout /t 3 /nobreak > nul

REM Get the local IP
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr "IPv4"') do (
    set "ip=%%a"
    goto :found
)
:found
set ip=%ip: =%

echo [4/4] Server started!
echo.
echo ========================================
echo       APK GENERATION OPTIONS
echo ========================================
echo.
echo Option 1: PWA Builder (Recommended)
echo   1. Go to: https://www.pwabuilder.com/
echo   2. Enter URL: http://%ip%:4174/
echo   3. Click "Generate Package"
echo   4. Select Android ^> Download APK
echo.
echo Option 2: Online Converters
echo   • PWA2APK: https://pwa2apk.com/
echo   • Use URL: http://%ip%:4174/
echo.
echo Option 3: Manual Upload
echo   1. Zip the 'dist' folder
echo   2. Upload to PWA Builder or PWA2APK
echo.
echo ========================================
echo Server running at: http://%ip%:4174/
echo Press Ctrl+C to stop server
echo ========================================
pause
