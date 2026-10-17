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
├── app/                             # Preact PWA (dev: 5173, prod: servie par l'API sur 8000)
│   ├── components/                  # Shared modular components (BottomNav, BalanceCard, etc.)
│   ├── features/                    # Feature engines & fine-grained subcomponents (20-50 lines)
│   │   ├── compose/                 # Social post creation & trade attachments
│   │   ├── home/                    # Wealth overview & quick action modals
│   │   ├── market/                  # BRVM stock catalog, search, sparklines, order drawer
│   │   └── social/                  # Leaderboard, copy-trading modal, community feed
│   ├── hooks/                       # GSAP safe-area scroll triggers
│   ├── state.ts                     # Video-game style Preact Signals reactive engine
│   ├── public/                      # PWA: manifest.webmanifest, sw.js, icons/
│   └── App.tsx                      # Root screen router
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

---

## Project Setup & Quick Start

### 1. Install Dependencies

```bash
deno install
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

## Installer TekkiTrade (PWA)

TekkiTrade est une Progressive Web App : pas de store, pas d'Android Studio ni de Xcode.

```bash
# Build de l'app (app/dist) puis API + PWA sur le même port
deno task start
```

Ouvrez `http://localhost:8000` (ou l'URL HTTPS de déploiement) :

- **Android / Chrome** : menu ⋮ → *Installer l'application*.
- **iPhone / Safari** : Partager → *Sur l'écran d'accueil*.
- **Desktop / Chrome, Edge** : icône d'installation dans la barre d'adresse.

Notes :

- Un service worker n'est actif qu'en **HTTPS** ou sur `localhost`. Pour tester sur un téléphone du réseau local, passez par un tunnel HTTPS (ex. `cloudflared tunnel --url http://localhost:8000`).
- Le service worker (`app/public/sw.js`) met en cache le shell et les assets ; `/api` n'est jamais mis en cache (soldes, cours et statuts Bitnob restent en direct). Incrémentez `VERSION` dans `sw.js` pour forcer un nettoyage des caches.
- En développement (`deno task dev`), le service worker n'est pas enregistré, pour ne pas interférer avec le HMR de Vite.

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
