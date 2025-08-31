# 📱 Generate APK for Manual Installation

## Method 1: Using PWA Builder (Recommended - Easiest)

### Step 1: Build Your App
```bash
npm run build
```

### Step 2: Use PWA Builder
1. Go to https://www.pwabuilder.com/
2. Enter your website URL: `http://192.168.31.226:4174/` (when server is running)
3. Or upload your `dist` folder
4. Click "Start" → "Generate Package"
5. Select "Android" → "Trusted Web Activity"
6. Download the generated APK

### Step 3: Install APK
- Transfer APK to your Android phone
- Enable "Install from Unknown Sources" in Settings
- Install the APK

---

## Method 2: Using Capacitor (More Control)

### Step 1: Install Capacitor
```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android
```

### Step 2: Initialize Capacitor
```bash
npx cap init "The Bible Project" "com.bibleproject.app"
```

### Step 3: Build and Add Android
```bash
npm run build
npx cap add android
npx cap copy
```

### Step 4: Generate APK
```bash
npx cap open android
```
This opens Android Studio where you can build the APK.

---

## Method 3: Using Cordova (Traditional)

### Step 1: Install Cordova
```bash
npm install -g cordova
```

### Step 2: Create Cordova Project
```bash
cordova create bible-project com.bibleproject.app "TheBibleProject"
cd bible-project
cordova platform add android
```

### Step 3: Copy Your Built Files
```bash
# Build your React app first
npm run build

# Copy dist contents to cordova www folder
```

### Step 4: Build APK
```bash
cordova build android
```

---

## Method 4: Online APK Generators (Quick & Easy)

### Websites that convert PWA to APK:
1. **PWA2APK**: https://pwa2apk.com/
2. **PWABuilder**: https://www.pwabuilder.com/
3. **Appmaker**: https://appmaker.xyz/pwa-to-apk

### Steps:
1. Upload your built website or provide URL
2. Configure app details (name, icon, etc.)
3. Download generated APK

---

## Let's Start with PWA Builder (Simplest)

Would you like me to:
1. **Set up PWA Builder method** (upload your site)
2. **Set up Capacitor** (more native features)
3. **Use online converter** (quickest)

**Recommendation**: Start with PWA Builder - it's the fastest way to get an APK!
