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

---

## Tekki AI & Tekki Voice

Tekki explique ce que l'utilisateur regarde (fiche action, portefeuille d'entraînement, profil d'exemple, post de la communauté), à l'écrit ou en notes vocales, en français ou en wolof. Il ne conseille pas.

Intégration : modules `api/tekki/` et `app/features/tekki/` ; dans les écrans existants, seulement des points d'entrée (bouton Tekki, carte sur la fiche action et le portefeuille, bouton sur les profils et les posts).

- **Tekki Analytics** (`api/tekki/analytics.ts`) calcule toutes les métriques à partir des historiques d'opérations : performance, taux de trades gagnants, gain et perte moyens, drawdown, durée de détention, exposition sectorielle, concentration, impact d'une réplication. Ce sont des règles explicites, testées dans `api/tekki/tekki_test.ts`.
- **RAG** (`api/tekki/knowledge.ts`) : une base de passages sourcés (BRVM, AMF-UMOA, Bitnob, fiches TekkiTrade). Chaque réponse affiche ses sources.
- **Garde-fous** (`api/tekki/guardrails.ts`) : consignes du modèle, plus un filtre de sortie côté serveur qui bloque les formulations de conseil en français et en wolof.
- **Fournisseurs interchangeables** (`api/tekki/providers.ts`) : Gemini (texte, transcription wolof et français, synthèse vocale) ou Ollama. Sans clé, Tekki répond à partir de ses calculs et de sa base documentaire.
- **Profils d'exemple** : les historiques des profils de `task-seed.ts` (Aïcha, Koffi, Mariam) sont générés (déterministes, à partir des cours BRVM réels) pour que Tekki Analytics calcule sur de vraies opérations. Le portefeuille lu par Tekki est le portefeuille d'entraînement, et les frais ceux de la SGI choisie dans le parcours.

Configuration, côté serveur uniquement :

```env
AI_PROVIDER=gemini
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-3-flash-preview
GEMINI_TTS_MODEL=gemini-3.8-flash-lite-tts
GEMINI_THINKING_LEVEL=minimal
OOLEL_TTS_URL=http://127.0.0.1:8010
OOLEL_LANGUAGES=wo,mixed,fr
```

Le quota gratuit de Gemini est compté par modèle et par jour (20 requêtes sur les plus récents). Tekki passe au modèle suivant de `GEMINI_FALLBACK_MODELS` dès qu'un modèle est saturé ou à court de quota, et met en cache les réponses et l'audio déjà produits.

### Voix wolof : Oolel-Voices (Soynade Research)

Les réponses en wolof sont lues par [Oolel-Voices](https://huggingface.co/soynade-research/Oolel-Voices), un modèle de synthèse vocale conçu pour le wolof par Soynade Research (licence AGPL-3.0). Il tourne en local (`tools/oolel/server.py`), sur GPU NVIDIA de préférence. Par défaut il lit aussi le français (`OOLEL_LANGUAGES=wo,mixed,fr`) ; retirer `fr` pour que le français soit lu par Gemini. Gemini prend le relais si Oolel est arrêté.

Installation (une fois, environ 5 Go) :

```bash
uv venv --python 3.12 tools/oolel/.venv
uv pip install --python tools/oolel/.venv/Scripts/python.exe torch==2.8.0 torchaudio==2.8.0 --index-url https://download.pytorch.org/whl/cu128
uv pip install --python tools/oolel/.venv/Scripts/python.exe -r tools/oolel/requirements.txt
```

Lancement (le modèle est téléchargé au premier démarrage) :

```bash
tools/oolel/.venv/Scripts/python.exe tools/oolel/server.py
```

Vitesse : sur une RTX 3060 portable, une phrase prend environ 1,3 fois sa durée à générer ; la boucle de génération (~75 % du temps) ne dépend d'aucun réglage du modèle. L'app lit donc la première phrase dès qu'elle est prête. `OOLEL_S3GEN_STEPS=5` (variable d'environnement au lancement du serveur Oolel) fait gagner ~0,7 s par phrase sur le décodage audio. Fermer les applications qui utilisent le GPU et passer Windows en mode « Meilleures performances » aide aussi.

Sous macOS/Linux, remplacer `.venv/Scripts/python.exe` par `.venv/bin/python` et installer `torch` sans l'index CUDA.

Routes : `POST /api/tekki/ask`, `POST /api/tekki/facts`, `POST /api/tekki/transcribe`, `POST /api/tekki/speak`, `GET /api/tekki/traders`, `GET /api/tekki/market`, `GET /api/tekki/status`.

---
