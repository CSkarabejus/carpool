# 🚗 SplitRide — Carpool Fuel & Cost Splitter

A mobile-first web app designed for calculating how much money each person owes the driver for carpools, road trips, daily commutes, and group travels.

Tested and optimized for **Poco X4 Pro** (Android) and PC browsers.

---

## 🌟 Key Features

1. **Two Flexible Fuel Calculation Methods**:
   - 🚗 **By Distance & Economy**: Enter driven distance (km or miles) + fuel consumption rate (L/100km or MPG). Includes a **🔄 Return Trip (2x)** toggle to instantly double distance for back-and-forth journeys!
   - ⛽ **By Direct Fuel Burned**: Enter total fuel volume (Liters or Gallons) from the gas receipt or pump fill.
2. **Passenger & Driver Split Logic**:
   - Set total number of people with quick stepper (`+` / `-`) or direct number input.
   - **"Include driver in split" toggle**:
     - **ON**: Everyone splits the cost equally ($Total / N$). Driver and passengers pay the same.
     - **OFF**: Passengers cover the trip cost ($Total / (N - 1)$), driver rides free for providing the vehicle and driving.
3. **Extra Trip Expenses**:
   - Highway tolls, vignettes, parking fees, and vehicle wear & tear / maintenance costs.
4. **Instant Split Hero Card**:
   - Shows bold **Each Passenger Pays** amount.
   - Shows **Driver Collects** total amount.
   - Shows total trip expense, fuel burned, and per-km cost breakdown.
5. **Quick Preset Car Profiles**:
   - Save your cars (e.g., *My Skoda 5.6 L/100km*, *Golf TDI 4.8 L/100km*) to load them with 1 tap.
6. **Trip History**:
   - Save completed trip calculations to review later.
7. **One-Tap Share Bill**:
   - Uses Android Native Share Sheet (WhatsApp, Telegram, Messenger, SMS) or copies formatted breakdown to clipboard.
8. **PWA (Progressive Web App)**:
   - Works 100% **offline** with Service Worker caching.
   - Can be installed directly onto your **Poco X4 Pro** home screen as a standalone native-feeling app!

---

## 💻 1. Testing on your PC

To test the app on your computer:

### Option A: Using the built-in launcher script
In terminal, simply run:
```bash
python3 start_server.py
```
This automatically starts the server and opens `http://localhost:8000` in your default browser.

### Option B: Direct Python HTTP server
```bash
python3 -m http.server 8000
```
Then open `http://localhost:8000` in Chrome, Safari, Firefox, or Edge.

> **Tip for PC testing**: On wide screens, the app shows a realistic mobile phone frame mockup. You can click **"Toggle View"** in the top bar to expand to full screen or test mobile dimensions using your browser's Developer Tools (`Cmd + Option + I` -> Mobile device toggle).

---

## 📱 2. Testing on your Poco X4 Pro

1. Make sure your **Poco X4 Pro** is connected to the **same Wi-Fi network** as your PC.
2. In the app on your PC, click the **"📲 Test on Poco X4 Pro"** button (or phone icon in header) to open the QR Code modal.
3. Point your Poco X4 Pro camera at the QR code on your PC screen, or open **Chrome** on your phone and type:
   ```text
   http://10.181.198.105:8000
   ```
   *(Or the IP address printed when running `python3 start_server.py`)*

---

## 📲 3. Installing as an App on your Poco X4 Pro

You do **not** need Android Studio or complex developer tools to install SplitRide on your Poco X4 Pro. Because SplitRide is a Progressive Web App (PWA):

1. Open `http://<YOUR_PC_IP>:8000` in **Chrome** on your Poco X4 Pro.
2. Tap the **"Install SplitRide"** banner inside the app, OR tap Chrome's **3 dots menu (⋮)** in the top-right corner.
3. Select **"Install app"** (or **"Add to Home screen"**).
4. Tap **"Install"**.

Done! SplitRide will now appear on your Poco X4 Pro app drawer and home screen with its custom icon. It opens in full-screen standalone mode without any browser URL bars, has haptic vibration feedback, and works **100% offline** on the road!

---

## 📦 4. Want a Standalone `.apk` File?

If you want a standalone `.apk` installer file to send to friends:
1. Deploy your Carpool folder to free static hosting (e.g., GitHub Pages, Vercel, or Netlify).
2. Go to **[PWABuilder.com](https://www.pwabuilder.com/)** (created by Microsoft).
3. Paste your URL and click **"Start"** -> **"Package for Android"**.
4. Download the signed `.apk` file ready to install on any Android phone!

---

## 🛠️ File Structure

- `index.html`: Main mobile application interface
- `style.css`: Modern responsive styles, dark/light theme, AMOLED optimization
- `app.js`: Calculation logic, unit conversions, presets, localStorage & sharing
- `qrcode.min.js`: Lightweight offline QR code generator for connecting phone
- `start_server.py`: Python launcher with local Wi-Fi IP detection
- `sw.js`: Service worker for offline caching
- `manifest.json`: Web App Manifest for mobile installation
- `icon.svg` & `icon-*.png`: High-resolution app icons
