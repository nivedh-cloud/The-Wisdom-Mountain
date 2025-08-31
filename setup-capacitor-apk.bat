@echo off
echo ========================================
echo   Capacitor APK Generation Setup
echo ========================================
echo.

REM Build the project first
echo [1/5] Building React project...
call npm run build
if %ERRORLEVEL% neq 0 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)

REM Initialize Capacitor
echo [2/5] Initializing Capacitor...
call npx cap init "The Bible Project" "com.bibleproject.app" --web-dir=dist
if %ERRORLEVEL% neq 0 (
    echo ERROR: Capacitor init failed!
    pause
    exit /b 1
)

REM Add Android platform
echo [3/5] Adding Android platform...
call npx cap add android
if %ERRORLEVEL% neq 0 (
    echo ERROR: Android platform add failed!
    pause
    exit /b 1
)

REM Copy web assets
echo [4/5] Copying web assets...
call npx cap copy
if %ERRORLEVEL% neq 0 (
    echo ERROR: Copy failed!
    pause
    exit /b 1
)

REM Sync
echo [5/5] Syncing...
call npx cap sync
if %ERRORLEVEL% neq 0 (
    echo ERROR: Sync failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo         Setup Complete!
echo ========================================
echo.
echo Next Steps:
echo 1. Install Android Studio (if not installed)
echo 2. Run: npx cap open android
echo 3. In Android Studio: Build ^> Generate Signed Bundle/APK
echo 4. Choose APK ^> Debug/Release ^> Finish
echo.
echo Alternative - Debug APK:
echo Run: npx cap run android --target=device
echo.
pause
