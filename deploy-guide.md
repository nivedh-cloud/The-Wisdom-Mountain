# Android Installation Guide for The Bible Project

## Option 1: Deploy as PWA (Recommended)

### Step 1: Deploy to a hosting service

#### Using Netlify (Free & Easy):
1. Go to [netlify.com](https://netlify.com)
2. Sign up with GitHub/Google
3. Drag and drop your `dist` folder from the project
4. Get your live URL (e.g., `https://yourapp.netlify.app`)

#### Using Vercel (Free & Easy):
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub/Google
3. Import your project from GitHub or upload the `dist` folder
4. Get your live URL (e.g., `https://yourapp.vercel.app`)

#### Using GitHub Pages (Free):
1. Push your code to GitHub
2. Go to repository Settings > Pages
3. Select source as GitHub Actions
4. Your app will be available at `https://yourusername.github.io/TheBibleProject`

### Step 2: Install on Android

1. **Open the deployed URL in Chrome on your Android device**
2. **Look for "Add to Home Screen" option in Chrome menu**
3. **Or you'll see an install banner automatically**
4. **Tap "Install" or "Add to Home Screen"**
5. **The app will appear on your home screen like a native app**

## Option 2: Build as Android APK

### Using Capacitor (Native App):
1. Install Capacitor
2. Add Android platform
3. Build APK file
4. Install APK on your device

## Option 3: Local Network Access

### For Testing (No internet required):
1. Run `npm run preview` on your computer
2. Find your computer's IP address
3. Access from your phone: `http://YOUR_IP:4173`
4. Add to home screen for quick access

## Features Available on Mobile:
- ✅ Offline access (PWA)
- ✅ Home screen icon
- ✅ Full-screen experience
- ✅ Touch-optimized interface
- ✅ Responsive design
- ✅ Local storage for settings

## Recommended: PWA Installation

The PWA option is best because:
- No app store approval needed
- Automatic updates
- Works offline
- Native-like experience
- Easy to share with others
