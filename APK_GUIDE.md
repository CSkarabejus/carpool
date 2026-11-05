# 📦 SplitRide — Standalone Offline APK Guide

This guide explains how to convert the SplitRide app into an **Android `.apk` file** that you can install directly on your **Poco X4 Pro**, with **zero servers and 100% offline capability**.

All project files have already been packaged into:
📁 **`/Users/domjan/Desktop/Carpool/SplitRide_offline.zip`**

---

## 🚀 Method 1: Instant Offline APK via AppsGeyser (Easiest — 1 Minute)

This method embeds your HTML, CSS, and JS files directly inside the APK's internal storage (`file:///android_asset/`), so it **never connects to any server**:

1. Open your browser and go to:
   👉 **[AppsGeyser Offline HTML5 App Creator](https://appsgeyser.com/create-offline-html5-app/)**
2. Click **Upload ZIP Archive**.
3. Select the file:
   `SplitRide_offline.zip` from your `/Users/domjan/Desktop/Carpool/` folder.
4. Set App Name to: **SplitRide**
5. Select or upload the icon: `icon-512.png` (from your Carpool folder).
6. Click **Next** ➔ **Create App**.
7. Download the generated **`SplitRide.apk`** file directly to your **Poco X4 Pro** (or transfer it via USB, Telegram, or WhatsApp).
8. On your phone, tap the `.apk` file ➔ tap **Install**.

Done! SplitRide is now a 100% native Android application on your Poco X4 Pro that runs completely offline with no servers.

---

## 🌐 Method 2: Via Permanent Cloud Link + PWABuilder (Official Microsoft Tool)

If you prefer an official Google/Microsoft signed APK:

### Step 1: Get a Permanent Free URL (30 seconds)
1. Go to **[Netlify Drop](https://app.netlify.com/drop)** in your computer browser.
2. Drag and drop your **Carpool folder** into the upload area.
3. It will give you a permanent, free HTTPS link (e.g. `https://splitride-carpool.netlify.app`).

### Step 2: Download the APK
1. Go to **[PWABuilder.com](https://www.pwabuilder.com/)**.
2. Paste your Netlify link and click **Start**.
3. Click **Package for Android** ➔ **Download Package / APK**.
4. Install the `.apk` on your Poco X4 Pro!
