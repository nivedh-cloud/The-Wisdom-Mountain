@echo off
echo Starting local preview server for mobile testing...
echo.
echo To access from your Android device:
echo 1. Make sure your phone and computer are on the same WiFi network
echo 2. Find your computer's IP address (run 'ipconfig' in another terminal)
echo 3. Open Chrome on your phone and go to: http://YOUR_IP_ADDRESS:4173
echo 4. Add to home screen for app-like experience
echo.
echo Starting server now...
npm run preview
