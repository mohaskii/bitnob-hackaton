# CameraStream PoC — Walkthrough

## What was built
A native Android camera preview that renders **behind** the Capacitor WebView, occupying the top 40% of the screen, fully controllable from the Preact web UI via `startCamera()` / `stopCamera()`.

## Files Changed

### Android Native (4 files)

| File | Action | Purpose |
|---|---|---|
| [activity_main.xml](file:///home/mohaskiiii/LoLo/capacitor/android/app/src/main/res/layout/activity_main.xml) | Modified | Replaced `CoordinatorLayout` with `FrameLayout` to allow inserting `SurfaceView` at index 0 behind the WebView |
| [AndroidManifest.xml](file:///home/mohaskiiii/LoLo/capacitor/android/app/src/main/AndroidManifest.xml) | Modified | Added `<uses-feature>` for camera hardware |
| [CameraStreamPlugin.java](file:///home/mohaskiiii/LoLo/capacitor/android/app/src/main/java/com/Lolo/app/plugins/CameraStreamPlugin.java) | **New** | Native plugin: manages SurfaceView lifecycle, camera permissions, 40% height calculation, WebView transparency |
| [MainActivity.java](file:///home/mohaskiiii/LoLo/capacitor/android/app/src/main/java/com/Lolo/app/MainActivity.java) | Modified | Registers `CameraStreamPlugin` before `super.onCreate()` |

### Web / Preact (4 files)

| File | Action | Purpose |
|---|---|---|
| [camera-stream.ts](file:///home/mohaskiiii/LoLo/app/plugins/camera-stream.ts) | **New** | Typed JS wrapper using `registerPlugin<CameraStreamPlugin>` |
| [CameraPoC.tsx](file:///home/mohaskiiii/LoLo/app/screens/CameraPoC.tsx) | **New** | PoC screen: 40% transparent top (camera shows through) + 60% opaque controls (stop, products, chat, bid) |
| [App.tsx](file:///home/mohaskiiii/LoLo/app/App.tsx) | Modified | Added `showCameraPoC` state and renders `<CameraPoC>` |
| [BottomNavBar.tsx](file:///home/mohaskiiii/LoLo/app/components/BottomNavBar.tsx) | Modified | Added `onSellClick` callback to the "Vendre" tab |

### Workflow

| File | Action | Purpose |
|---|---|---|
| [capacitor-native-plugins.md](file:///home/mohaskiiii/LoLo/.agent/workflows/capacitor-native-plugins.md) | **New** | Documents the pattern for creating native plugins, including Capacitor 8 gotchas |

## Verification Results

| Check | Result |
|---|---|
| `deno check` (all 4 web files) | ✅ Pass |
| `npx cap sync android` | ✅ Synced (1 plugin: @capacitor/camera) |
| `./gradlew assembleDebug` | ✅ BUILD SUCCESSFUL |

## How to Test on Device

1. Start the dev server: `cd app && deno task dev`
2. Open in Android Studio: `cd capacitor && npx cap open android`
3. Run on a physical device (camera won't work on emulator)
4. In the app, tap **Vendre** (+ icon) in the bottom nav
5. Tap **Démarrer la Caméra** → grant permission → camera preview fills top 40%
6. Tap **Arrêter la Caméra** → preview disappears
7. Tap the back chevron to return to the feed

## Issue Found & Fixed During Build
- **`getBridge().getLogger()`** does not exist in Capacitor 8's `Bridge` class. Replaced all logging calls with standard `android.util.Log.e()`.
