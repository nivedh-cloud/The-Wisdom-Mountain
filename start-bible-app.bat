@echo off
title Bible Project - Mobile Server
echo.
echo ===================================
echo   THE BIBLE PROJECT - MOBILE SERVER
echo ===================================
echo.
echo Your app will be available at:
echo http://192.168.31.226:4173
echo.
echo Instructions for Android:
echo 1. Connect your Android to the same WiFi
echo 2. Open Chrome browser on your phone
echo 3. Go to: 192.168.31.226:4173
echo 4. Tap Chrome menu (3 dots) 
echo 5. Select "Add to Home screen"
echo 6. Name it "Bible Project" and tap "Add"
echo.
echo Keep this window open while using the app on mobile!
echo Press Ctrl+C to stop the server.
echo.
echo Starting server...
npm run preview -- --host
pause

