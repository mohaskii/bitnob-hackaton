# TekkiTrade — Fintech & Social Trading Platform for BRVM

TekkiTrade is a mobile-first financial technology application designed to democratize investing on the **Bourse Régionale des Valeurs Mobilières (BRVM)** (West Africa's regional stock exchange across UEMOA/WAEMU).

It introduces three core pillars:
1. **Fractional Share Investing**: Buy into premier BRVM equities (Sonatel, Orange CI, Société Générale CI, Coris Bank, etc.) starting from **1 000 FCFA** rather than full share prices (18 000+ FCFA).
2. **Social Copy-Trading**: Follow and automatically replicate top verified regional traders, complete with transparent win rates, performance metrics, and stop-loss limits.
3. **Bitnob Payment Rails**: Universal on/off-ramps bridging global crypto and African mobile money:
   - **Bitcoin Lightning Network**: Instant low-fee micro-deposits via BOLT-11 invoices.
   - **USDT Stablecoins**: TRC-20 and ERC-20 on-chain deposits.
   - **Local Mobile Money Cashouts**: Direct withdrawals to **Wave** and **Orange Money**.
   - **Virtual Visa Cards**: Instant card issuance to spend dividend earnings directly on global subscriptions and online merchants.

---

## Architecture Overview

```
tekkitrade/
├── api/                             # Deno Backend Service (Port 8000)
│   ├── bitnob/
│   │   ├── client.ts                # Bitnob API Client (Lightning, USDT, MoMo, Cards)
│   │   └── webhook.ts               # HMAC-SHA512 Webhook handler & SQLite balance settlement
│   ├── lib/                         # Env & logging utilities
│   ├── routes.ts                    # HTTP endpoints using @01edu/api/router & @01edu/api/validator
│   ├── schema.ts                    # SQLite tables (@01edu/db) & parameterized sqlQuery
│   ├── server.ts                    # Server entrypoint (Deno.serve)
│   └── task-seed.ts                 # Database seeder (Demo user, BRVM stocks, traders, feed)
├── app/                             # Preact Frontend & Mobile UI (Port 5173)
│   ├── components/                  # Shared modular components (BottomNav, BalanceCard, etc.)
│   ├── features/                    # Feature engines & fine-grained subcomponents (20-50 lines)
│   │   ├── compose/                 # Social post creation & trade attachments
│   │   ├── home/                    # Wealth overview & quick action modals
│   │   ├── market/                  # BRVM stock catalog, search, sparklines, order drawer
│   │   └── social/                  # Leaderboard, copy-trading modal, community feed
│   ├── hooks/                       # GSAP safe-area scroll triggers
│   ├── state.ts                     # Video-game style Preact Signals reactive engine
│   └── App.tsx                      # Root screen router
├── capacitor/                       # Capacitor 8 Native Mobile Container
│   ├── android/                     # Native Android Studio project
│   ├── capacitor.config.json        # Capacitor configuration
│   └── package.json                 # Capacitor CLI & native plugins
└── deno.json                        # Root Deno workspace & tasks
```

---

## Prerequisites & Installation (Step-by-Step)

Install each required toolchain component one by one:

### 1. Deno (Runtime for Backend & Frontend Bundler)

TekkiTrade requires Deno (v2.0+ recommended):

- **Linux / macOS**:
  ```bash
  curl -fsSL https://deno.land/install.sh | sh
  ```
- **macOS via Homebrew**:
  ```bash
  brew install deno
  ```
- **Windows (PowerShell)**:
  ```powershell
  irm https://deno.land/install.ps1 | iex
  ```
- **Verify installation**:
  ```bash
  deno --version
  ```

### 2. Node.js & npm (Required for Capacitor CLI)

Capacitor CLI relies on Node.js and npm:

- **Linux / Ubuntu / Debian**:
  ```bash
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
  ```
- **macOS via Homebrew**:
  ```bash
  brew install node
  ```
- **Windows**: Download the LTS installer from [nodejs.org](https://nodejs.org/).
- **Verify installation**:
  ```bash
  node -v
  npm -v
  npx -v
  ```

### 3. Java Development Kit (JDK 17 or 21 for Android)

Android builds require OpenJDK 17 or 21:

- **Linux**:
  ```bash
  sudo apt update && sudo apt install -y openjdk-17-jdk
  ```
- **macOS via Homebrew**:
  ```bash
  brew install openjdk@17
  sudo ln -sfn /opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-17.jdk
  ```
- **Verify and set JAVA_HOME**:
  ```bash
  java -version
  # Add to your ~/.bashrc or ~/.zshrc:
  export JAVA_HOME=$(dirname $(dirname $(readlink -f $(which javac))))
  ```

### 4. Android Studio & Android SDK (For Android)

1. Download and install **Android Studio** from [developer.android.com/studio](https://developer.android.com/studio).
2. During setup, install:
   - **Android SDK Platform-Tools** (`adb`)
   - **Android SDK Build-Tools** (version 34+)
   - **Android SDK Command-line Tools**
   - **Android SDK Platform** (API 34 / Android 14)
3. Set your Android environment variables in `~/.bashrc` or `~/.zshrc`:
   ```bash
   export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
   ```
4. Verify `adb`:
   ```bash
   adb version
   ```

### 5. Xcode & Xcode Command Line Tools (For iOS on macOS only)

1. Install **Xcode** from the Mac App Store.
2. Install Xcode Command Line Tools:
   ```bash
   xcode-select --install
   ```
3. Accept the Xcode license:
   ```bash
   sudo xcodebuild -license accept
   ```
4. Install CocoaPods (if using legacy pods):
   ```bash
   sudo gem install cocoapods
   ```

---

## Project Setup & Quick Start

### 1. Install Dependencies

Install the project dependencies for both the root workspace and Capacitor:

```bash
# In project root:
deno install

# In capacitor directory:
cd capacitor && npm install && cd ..
```

### 2. Environment Configuration

Create or verify the `.env` file in the project root:

```env
DATABASE_PATH=tekkitrade.db
PORT=8000
BITNOB_BASE_URL=https://sandboxapi.bitnob.co/api/v1
BITNOB_API_KEY=mock_sandbox_key
BITNOB_WEBHOOK_SECRET=mock_webhook_secret
SESSION_SECRET=tekkitrade-dev-secret-key-change-in-production
```

> **Note on Bitnob Sandbox**: When using `mock_sandbox_key` or running without active internet, the Bitnob client automatically engages resilient simulations for Lightning invoices, USDT addresses, and virtual Visa cards.

### 3. Seed the SQLite Database

Initialize the database with the demo account, 7 BRVM equities, top traders, and social feed posts:

```bash
deno task db:seed
```

Output:
```
ℹ️ [DB Seed] Initializing TekkiTrade SQLite seed data...
ℹ️ [DB Seed] Demo user (ID 1) & wallet initialized (209 890 FCFA)
ℹ️ [DB Seed] BRVM stocks verified (7 seeded)
ℹ️ [DB Seed] Top Traders seeded
ℹ️ [DB Seed] Social posts seeded
ℹ️ [DB Seed] Seeding completed successfully!
```

### 4. Run the Backend API Server

Start the REST API server:

```bash
deno task server
```

The server binds to `http://0.0.0.0:8000`.

### 5. Run the Frontend Web Application

In a separate terminal, launch the Vite dev server:

```bash
deno task dev
```

The web app is accessible at `http://localhost:5173`.

---

## Running on Mobile with Capacitor

Capacitor bridges the Preact web frontend into a high-performance native Android and iOS mobile app.

### Setting up the Host URL for Mobile

When running on an emulator or physical mobile phone, the mobile device cannot access `localhost` directly. Update `capacitor/capacitor.config.json` with your development computer's local Wi-Fi IP address:

```json
{
  "appId": "com.Lolo.app",
  "appName": "TekkiTrade",
  "webDir": "dist",
  "server": {
    "url": "http://192.168.1.137:5173",
    "cleartext": true
  }
}
```

> Replace `192.168.1.137` with your computer's local IP (obtain via `ip a` on Linux or `ifconfig` on macOS).

---

### Android Workflow (Emulators & Paired Physical Devices)

#### Option A: Running on an Android Emulator
1. Open **Android Studio** -> **Virtual Device Manager** (Device Manager in right sidebar).
2. Click **Create Device** (e.g. Pixel 8, System Image: API 34).
3. Start the virtual device.
4. Verify `adb` detects the emulator:
   ```bash
   adb devices
   ```
   *(Example output: `emulator-5554 device`)*

#### Option B: Pairing a Physical Android Device
1. On your Android phone, enable **Developer Options**:
   - Go to **Settings** -> **About Phone** -> Tap **Build Number** 7 times until you see *"You are now a developer!"*.
2. In **Settings** -> **System** -> **Developer Options**:
   - Enable **USB Debugging**.
   - (Optional) Enable **Wireless Debugging** if connecting over Wi-Fi without cables.
3. Connect your device via USB cable. When prompted on the phone screen, check **Always allow from this computer** and tap **Allow**.
4. If using **Wireless Debugging**:
   - Tap **Wireless Debugging** -> **Pair device with pairing code**.
   - In terminal:
     ```bash
     adb pair <ip-address>:<port> <pairing-code>
     adb connect <ip-address>:<connect-port>
     ```
5. Check connected devices:
   ```bash
   adb devices
   ```

#### Listing Targets and Launching the App
Navigate to the `capacitor/` folder:

```bash
cd capacitor

# 1. List all available devices and emulators
npx cap run android --list
```

Example output:
```
Available Android targets:
  emulator-5554 (Pixel 8 API 34)
  R58M345XYZW   (Samsung Galaxy S22)
```

```bash
# 2. Sync web assets and plugins to native Android project
npx cap sync android

# 3. Build and launch on your specific target
npx cap run android --target <device id>
```

*Example running on emulator:*
```bash
npx cap sync android && npx cap run android --target emulator-5554
```

*Example running on physical phone:*
```bash
npx cap sync android && npx cap run android --target R58M345XYZW
```

#### Opening Android Studio Directly
If you prefer building and inspecting directly inside Android Studio:
```bash
cd capacitor
npx cap open android
```
In Android Studio:
1. Wait for Gradle sync to finish.
2. Select your device from the target dropdown in the top toolbar.
3. Click the green **Run** (Play) button or press `Shift + F10`.

---

### iOS Workflow with Xcode (Step-by-Step)

> **Requirement**: macOS with Xcode 15+ installed.

#### Step 1: Add iOS Platform (First time only)
```bash
cd capacitor
npx cap add ios
```

#### Step 2: Sync Web Assets to Xcode Project
```bash
npx cap sync ios
```

#### Step 3: List Available iOS Simulators and Devices
```bash
npx cap run ios --list
```
Example output:
```
Available iOS targets:
  iPhone 15 Pro (Simulator - 785A1B8E-...)
  iPhone 15 (Simulator - 90EFB23C-...)
  Mohamed's iPhone (Device - 00008101-...)
```

#### Step 4: Run via Command Line
```bash
npx cap run ios --target <device id>
```
*Example:*
```bash
npx cap run ios --target "iPhone 15 Pro"
```

#### Step 5: Opening and Configuring in Xcode
Open the iOS project in Xcode:
```bash
cd capacitor
npx cap open ios
```

Configure signing in Xcode:
1. In Xcode's left **Project Navigator**, click the top-level **App** project item.
2. Select the **App** target and open the **Signing & Capabilities** tab.
3. Check the box **Automatically manage signing**.
4. In the **Team** dropdown, select your Apple Developer Account (or personal Apple ID).
5. In the top toolbar device selector, pick your desired **Simulator** (e.g., *iPhone 15 Pro*) or your connected physical iPhone.
6. Press the **Play** button (or press `Cmd + R`) to compile and run.

#### Running on a Physical iPhone:
1. When running on a physical iPhone for the first time with a free personal developer account, iOS blocks execution until the certificate is trusted.
2. On your iPhone, open **Settings** -> **General** -> **VPN & Device Management**.
3. Under **Developer App**, select your Apple ID email.
4. Tap **Trust [Your Name/Email]** and confirm.
5. Tap the TekkiTrade app icon on your home screen to launch.

---

## API Documentation & Curl Examples

The backend is built with `@01edu/api/router` and `@01edu/api/validator`. Below are quick test commands:

### 1. Get Current User & Portfolio Valuation
```bash
curl -s http://localhost:8000/api/user/me
```

### 2. Fetch BRVM Stock Catalog
```bash
curl -s http://localhost:8000/api/market/stocks
```

### 3. Place a Fractional Stock Order (dès 1 000 FCFA)
```bash
curl -s -X POST http://localhost:8000/api/market/order \
  -H "Content-Type: application/json" \
  -d '{"symbol":"SNTS","action":"ACHAT","amountFcfa":5000}'
```

### 4. Create a Bitcoin Lightning Deposit Invoice (Bitnob)
```bash
curl -s -X POST http://localhost:8000/api/wallet/deposit/lightning \
  -H "Content-Type: application/json" \
  -d '{"amountFcfa":10000,"amountSat":15000}'
```

### 5. Generate a USDT Deposit Address (Bitnob)
```bash
curl -s -X POST http://localhost:8000/api/wallet/deposit/usdt \
  -H "Content-Type: application/json" \
  -d '{"chain":"TRX"}'
```

### 6. Create Copy-Trading Contract
```bash
curl -s -X POST http://localhost:8000/api/social/copy \
  -H "Content-Type: application/json" \
  -d '{"traderId":"1","allocatedFcfa":25000,"stopLossPercent":15,"copyOpenTrades":true}'
```

### 7. Simulate Bitnob Webhook Payment Crediting
```bash
curl -s -X POST http://localhost:8000/api/bitnob/webhook \
  -H "Content-Type: application/json" \
  -d '{"event":"lightning.invoice.paid","data":{"id":"inv_test","reference":"LN_REF","amount":10000,"status":"SUCCESS"}}'
```

---

## Code Quality & Patterns

The codebase strictly follows the rules documented in [`.agent/rules/pattern.md`](.agent/rules/pattern.md):

- **Zero `useState` in Components**: All mutable state is owned by hoisted signal engines (`home-state.ts`, `market-state.ts`, `social-state.ts`, `compose-state.ts`).
- **Decomposition Discipline**: UI components are fine-grained (20-50 lines each), preventing monolithic components and ensuring surgical re-renders.
- **Zero Emojis**: Clean, professional fintech typography with Lucide vector icons.
- **Strict Typing (Zero `interface`)**: All data structures are declared as `type` and derived directly from `@01edu/api/validator` schemas.
- **Safe SQL**: All SQLite queries use parameterized placeholders (`?`) to prevent SQL injection and quoting issues.

---

## Verification & Typecheck

Run the complete TypeScript verification across both frontend and backend:

```bash
deno check \
  api/server.ts \
  api/routes.ts \
  api/schema.ts \
  api/bitnob/client.ts \
  api/bitnob/webhook.ts \
  api/task-seed.ts \
  app/App.tsx \
  app/state.ts \
  app/screens/HomeScreen.tsx \
  app/screens/MarketScreen.tsx \
  app/screens/ComposeScreen.tsx
```

---

## Tekki AI & Tekki Voice

Tekki explique ce que l'utilisateur regarde (action, profil, opération, réplication). Il ne conseille pas.

- **Tekki Analytics** (`api/tekki/analytics.ts`) calcule toutes les métriques à partir des historiques d'opérations : performance, taux de trades gagnants, gain et perte moyens, drawdown, durée de détention, exposition sectorielle, concentration, impact d'une réplication. Ce sont des règles explicites, testées dans `api/tekki/tekki_test.ts`.
- **RAG** (`api/tekki/knowledge.ts`) : une base de passages sourcés (BRVM, AMF-UMOA, Bitnob, fiches TekkiTrade). Chaque réponse affiche ses sources.
- **Garde-fous** (`api/tekki/guardrails.ts`) : consignes du modèle, plus un filtre de sortie côté serveur qui bloque les formulations de conseil en français et en wolof.
- **Fournisseurs interchangeables** (`api/tekki/providers.ts`) : Gemini (texte, transcription wolof et français, synthèse vocale) ou Ollama. Sans clé, Tekki répond à partir de ses calculs et de sa base documentaire.
- **Profils d'exemple** : les historiques des profils de démonstration sont générés (déterministes, à partir des cours BRVM réels) et affichés comme exemples.

Configuration, côté serveur uniquement :

```env
AI_PROVIDER=gemini
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-3.8-flash
GEMINI_TTS_MODEL=gemini-3.8-flash-tts
```

Routes : `POST /api/tekki/ask`, `POST /api/tekki/facts`, `POST /api/tekki/transcribe`, `POST /api/tekki/speak`, `GET /api/tekki/traders`, `GET /api/tekki/market`, `GET /api/tekki/status`.

---

## Connecteur SGI (`api/sgi/`)

TekkiTrade ne passe pas d'ordre en bourse. Il transmet l'intention de l'utilisateur à une SGI à travers une interface unique, `SGIProvider` (`api/sgi/provider.ts`) : instruments, cotations, compte, passage, suivi et annulation d'ordres, positions, mouvements.

- **`MockSGIProvider`** (`api/sgi/mock.ts`) simule l'API d'une SGI régulée, ce n'est pas une fausse bourse. Il fournit :
  - une référence SGI (`ORD-2026-…`) ;
  - les statuts `PENDING → ACCEPTED → PARTIALLY_FILLED / FILLED`, `REJECTED`, `CANCELLED` ;
  - les frais BRVM (0,20 %), DC/BR (0,10 %), le courtage et la taxe ;
  - les rejets motivés (solde, titres, seuil de ±7,5 %) ;
  - les ordres limités qui attendent dans le carnet ;
  - l'idempotence ;
  - l'investissement fractionné **simulé** et signalé comme tel.

  Les prix sont les vrais cours différés de la BRVM.
- **Orchestration TekkiTrade** (`api/sgi/routes.ts`) : aperçu (quantité, frais, cash avant/après, exposition, avertissements), puis **confirmation explicite obligatoire**, puis transmission à la SGI et suivi des statuts.
- **Passage à une vraie SGI** : il suffit d'implémenter `SGIProvider` et de changer `SGI_PROVIDER` dans `api/sgi/index.ts`. L'interface, Tekki AI et le portefeuille ne changent pas : les positions affichées viennent toujours de la SGI.

Routes : `GET /api/sgi/info`, `GET /api/sgi/portfolio`, `POST /api/sgi/orders/preview`, `POST /api/sgi/orders` (avec `confirmed: true` et `idempotencyKey`), `GET /api/sgi/order`, `POST /api/sgi/orders/cancel`.
