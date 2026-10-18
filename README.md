# TekkiTrade — Demystifying BRVM Investing for West Africa & the Diaspora

[![Deno](https://img.shields.io/badge/Deno-2.0+-black?logo=deno)](https://deno.land/)
[![Preact Signals](https://img.shields.io/badge/Preact-Signals-673ab8?logo=preact)](https://preactjs.com/)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable-blue?logo=pwa)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
[![Bitnob Rails](https://img.shields.io/badge/Bitnob-Lightning%20%7C%20USDC%20%7C%20MoMo-F7931A)](https://bitnob.dev)
[![Tekki AI](https://img.shields.io/badge/Tekki%20AI-Gemini%20%7C%20Oolel%20Wolof-4285F4)](https://huggingface.co/soynade-research/Oolel-Voices)

**TekkiTrade** is an investment and financial education platform designed to democratize access to the **Bourse Régionale des Valeurs Mobilières (BRVM)**—the regional stock exchange serving the 8 West African nations of the UEMOA/WAEMU zone (Senegal, Côte d'Ivoire, Benin, Burkina Faso, Mali, Niger, Togo, Guinea-Bissau).

By bridging **Bitnob's payment rails**, **institutional SGI brokerage partners**, **fractional share mechanics**, and **Tekki AI's bilingual Wolof/French audio companion**, TekkiTrade removes the traditional barriers of high share prices, complex paperwork, geographic distance, and financial jargon.

---

## Key Pillars & Recent Innovations

### 1. Fractional BRVM Share Investing (dès 1 000 FCFA)
- **Accessible Capital**: Blue-chip BRVM stocks like Sonatel (SNTS) or Orange CI (ORAC) traditionally require 15 000–20 000+ FCFA per share. TekkiTrade enables fractional equity orders starting from just **1 000 FCFA**.
- **Real SGI Routing**: Live orders are channeled through institutional SGI gateways (e.g. Atlantique Capital) via an OMS connector.
- **Transparent Regulatory Fee Engine**: Real-time breakdown of all regulatory fees compliant with AMF-UMOA / CREPMF (0.20%), BRVM transaction tax (0.30%), DC/BR custody fees, SGI brokerage commissions (1.00%), and 18% VAT.
- **Formal Contract Notes**: Generates institutional transaction records (*avis d'opéré*) with unique SGI settlement references.

### 2. Universal Bitnob Payment Rails
- **Global Crypto to Local Fiat**: Diaspora investors and local savers fund their brokerage accounts via **Bitcoin Lightning Network** or **USD Stablecoins (USDC / USDT)** on Polygon.
- **Live Payout Quotations**: Real-time exchange rate locks, fee transparency, and expiration countdowns via Bitnob Payout API.
- **Direct SGI Settlement**: Automated payout delivery into SGI bank or Mobile Money collection accounts (**Wave**, **Orange Money**, **MTN**, **Moov**) across Senegal and Côte d'Ivoire.
- **Instant Crediting**: Automatic portfolio cash settlement upon Bitnob delivery confirmation (`creditOnDelivery`).
- **Resilient Sandbox Engine**: Built-in test balance simulation for frictionless live hackathon demonstrations.

### 3. Tekki AI & Tekki Voice (Wolof & French)
- **Local Language Audio Companion**: Native Wolof speech synthesis powered by [Oolel-Voices](https://huggingface.co/soynade-research/Oolel-Voices) (developed by Soynade Research) paired with Gemini fallback and audio transcription.
- **Zero Financial Advice Guardrails**: Server-side guardrails and strict system prompts enforce pure financial education; speculative advice ("buy/sell") is blocked in both French and Wolof.
- **Tekki Analytics**: Deterministic FIFO trade calculation engine computing win rate, average win/loss, maximum drawdown, sector concentration, and portfolio replication impact.
- **RAG Knowledge Base**: Verified passages citing official BRVM rules, AMF-UMOA regulations, and financial glossaries. Every AI response includes verifiable source tags.
- **Contextual In-App Triggers**: Launch Tekki directly from stock sheets, portfolio overviews, or community trade posts.

### 4. Progressive Web App (PWA) & Responsive Desktop UI
- **Zero App Store Friction**: Installable immediately on Android (Chrome), iOS (Safari "Add to Home Screen"), and Desktop (Chrome, Edge, Brave, Safari) without app store delays.
- **Offline Shell & Fast Caching**: Custom Service Worker (`app/public/sw.js`) provides cache-first static asset delivery, network-first page shell fallbacks, and strict zero-cache bypass on real-time financial endpoints (`/api/*`).
- **Adaptive Screen Layouts**:
  - *Mobile*: Ergonomic bottom navigation, gesture-friendly sheets, floating action triggers.
  - *Desktop (`lg+`)*: Persistent sidebar navigation (`SideNav.tsx`), 2-column dashboards, centered modal dialogs, and split-screen auth screens.
- **Smart Install Dialog**: Reactive in-app prompt modal with OS-specific install instructions and standalone mode detection.

### 5. Secure Authentication & Password Protection ("pwd")
- **PBKDF2-SHA256 Encryption**: Password hashing using 210,000 iterations with a unique per-user 16-byte cryptographically secure random salt.
- **Constant-Time Verification**: `timingSafeEqual` prevents timing side-channel attacks during password checks and signature verification.
- **Stateless Tamper-Evident Tokens**: HMAC-SHA256 signed session tokens (`<userId>.<expiresAt>.<hmac>`) avoiding server-side token bloat.
- **Dual Session Lifecycle**:
  - *Guest Mode*: Instant one-click exploration (`POST /api/auth/guest`) to inspect market data and paper trade.
  - *Registered Member*: Secure registration (`POST /api/auth/register`) with pre-validated SGI brokerage account generation for live trading.
- **Slide-In Sidebar & Logout**: Quick-access profile drawer with session management and authenticated logout (`POST /api/auth/logout`).

### 6. Peer-to-Peer (P2P) Internal Transfers
- **Instant & Fee-Free**: Transfer FCFA balances between TekkiTrade accounts in seconds.
- **Recipient Directory**: Autocomplete search by username (`@handle`) or investor account ID (`POST /api/users/lookup`).
- **Shareable Receipts & History**: Digital transfer receipts with unique references (`TRF-...`), transaction notes, and complete ledger history.

### 7. Dual Portfolio Modes: Training vs. Live
- **Paper Trading Sandbox**: 1 000 000 FCFA virtual cash balance for risk-free training with real delayed BRVM prices, simulated fills, and P&L history.
- **Live SGI Brokerage**: Real cash portfolio connected to SGI accounts, displaying executed fractional positions, cash balances, and dividends.

### 8. Educational Social Community
- **Interactive Investor Feed**: Community feed where verified members share real trade executions, investment theses, and market sentiments (Bullish / Bearish / Neutral).
- **Threaded Discussions & Likes**: Engage with other investors through comments and likes.
- **AI Rationale Breakdown**: Tap *Comprendre avec Tekki* on any post to inspect the trader's underlying asset metrics without bias.

### 9. SGI Partner Portal & Investor Journey
- **Onboarding Journey (`/journey`)**: Step-by-step account opening pipeline with SGI selection, KYC document uploads, and regulatory compliance agreements.
- **Institutional SGI Portal (`/partner`)**: SGI back-office dashboard to inspect client submissions, monitor Bitnob payment inflows, and audit trade allocations.

### 10. Bilingual Editorial Landing & Brand Identity
- **FR / EN Localization**: Seamless switching between French and English across the landing page and entire application using `@preact/signals` i18n engine.
- **Smooth Editorial Design**: Clean typography, bespoke SVG branding (`logo.svg`, `logo-wordmark.svg`), and Lenis smooth scrolling.

---

## Architecture & Codebase Layout

TekkiTrade is built with **Deno 2.0+**, **Preact**, **Tailwind CSS v4**, and **SQLite**. Mutable state strictly follows the **Video-Game Style Signals Architecture** documented in [`.agent/rules/pattern.md`](.agent/rules/pattern.md).

```
tekkitrade/
├── api/                             # Deno Backend Services & REST API
│   ├── bitnob/                      # Bitnob API client & HMAC webhook settlement
│   │   ├── client.ts                # Payout quotes, Lightning, USDT/USDC, MoMo payouts
│   │   └── webhook.ts               # Webhook verification & automatic settlement
│   ├── domain/                      # Core business logic & domain test suites
│   │   ├── auth.ts                  # PBKDF2 password hashing & HMAC session tokens
│   │   ├── companies.ts             # 48+ BRVM listed corporate profiles
│   │   ├── fees.ts                  # AMF-UMOA, BRVM & SGI regulatory fee math
│   │   ├── funding.ts               # Bitnob quote & payout lifecycle
│   │   ├── journey.ts               # SGI onboarding journey & compliance checks
│   │   ├── live_trading.ts          # SGI fractional order matching & OMS gateway
│   │   ├── paper.ts                 # Virtual paper trading sandbox engine
│   │   ├── sgi.ts                   # SGI partner profiles & tariff specifications
│   │   └── transfers.ts             # Peer-to-peer internal fund transfers
│   ├── lib/                         # Environment config, auth guards & logging
│   ├── sgi/                         # SGI institutional gateway client
│   ├── tekki/                       # Tekki AI engine (RAG, analytics, voice)
│   │   ├── analytics.ts             # FIFO trade analytics & portfolio metrics
│   │   ├── assistant.ts             # Prompt orchestration & Gemini integration
│   │   ├── guardrails.ts            # Non-advisory output filter (FR & Wolof)
│   │   ├── knowledge.ts             # RAG knowledge base & sourced citations
│   │   ├── providers.ts             # Multi-model fallbacks (Gemini, Ollama)
│   │   └── routes.ts                # Audio transcription & TTS endpoints
│   ├── market-data.ts               # Live BRVM scraping & SQLite quote caching
│   ├── routes.ts                    # HTTP router (@01edu/api/router)
│   ├── schema.ts                    # SQLite database schema & parameterized queries
│   ├── server.ts                    # HTTP server entrypoint (port 8000)
│   └── task-seed.ts                 # Deterministic database seeder
├── app/                             # Preact Frontend & PWA Application
│   ├── components/                  # Shared atomic UI primitives (BottomNav, SideNav, UI kit)
│   ├── features/                    # Signal state engines & fine-grained subcomponents
│   │   ├── compose/                 # Social post authoring & trade attachments
│   │   ├── funding/                 # Bitnob funding modal, quotes & payout steps
│   │   ├── home/                    # Wealth dashboard, sidebar menu & quick actions
│   │   ├── journey/                 # SGI onboarding checklist & document upload
│   │   ├── landing/                 # Editorial bilingual landing with smooth scroll
│   │   ├── learn/                   # BRVM educational modules & glossary
│   │   ├── market/                  # Stock catalog, search, sparklines & order sheet
│   │   ├── partner/                 # Institutional SGI back-office dashboard
│   │   ├── portfolio/               # Real SGI vs. Training portfolio views
│   │   ├── pwa/                     # PWA install state, prompt modal & guide
│   │   ├── session/                 # Auth screens (Welcome, Register, Login)
│   │   ├── social/                  # Community discussions, comments & trade cards
│   │   ├── tekki/                   # Tekki AI chat, voice player & microphone recorder
│   │   ├── trade/                   # Order ticket, fee breakdown & contract note
│   │   └── transfers/               # P2P send/receive modals, receipts & history
│   ├── i18n/                        # Reactive Preact Signals localization (FR / EN)
│   ├── public/                      # Static assets, SVG logos, PWA manifest & sw.js
│   ├── screens/                     # Thin screen orchestrators (HomeScreen, MarketScreen, etc.)
│   ├── build-config.ts              # Vite + Tailwind v4 bundler configuration
│   └── main.tsx                     # PWA registration & DOM root mounting
├── docs/                            # Guides, demo playbooks & deployment docs
│   ├── DEMO.md                      # 6-minute end-to-end hackathon demo script
│   ├── DEPLOY.md                    # Production hosting instructions
│   └── GUIDE-TEST.md                # 15-minute manual QA verification checklist
├── tools/oolel/                     # Oolel-Voices Wolof neural TTS service
│   ├── server.py                    # Local PyTorch Wolof TTS HTTP server (port 8010)
│   └── requirements.txt             # Python dependencies
├── deno.json                        # Deno workspace tasks & dependency map
└── compose.yaml                     # Docker Compose multi-service deployment
```

---

## Prerequisites & Installation

### 1. Deno (v2.0+)
TekkiTrade uses Deno for both backend execution and frontend bundling:

```bash
# Linux / macOS
curl -fsSL https://deno.land/install.sh | sh

# macOS via Homebrew
brew install deno

# Windows (PowerShell)
irm https://deno.land/install.ps1 | iex
```

Verify installation:
```bash
deno --version
```

### 2. Python 3.12+ (Optional — only for local Wolof TTS)
If running the native Wolof speech neural model locally, Python with GPU/CUDA is recommended:
```bash
uv venv --python 3.12 tools/oolel/.venv
uv pip install --python tools/oolel/.venv/bin/python torch==2.8.0 torchaudio==2.8.0
uv pip install --python tools/oolel/.venv/bin/python -r tools/oolel/requirements.txt
```
*(On Windows, use `.venv/Scripts/python.exe` instead of `.venv/bin/python`)*.

---

## Quick Start & Local Development

### 1. Install Dependencies
```bash
deno install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

| Variable | Description | Default / Example |
|---|---|---|
| `DATABASE_PATH` | Path to SQLite database file | `tekkitrade.db` |
| `PORT` | HTTP server port | `8000` |
| `BITNOB_MODE` | Bitnob integration mode (`simulation`, `sandbox`, `live`) | `sandbox` |
| `BITNOB_BASE_URL` | Bitnob API base endpoint | `https://sandboxapi.bitnob.co/api/v1` |
| `BITNOB_CLIENT_ID` | Bitnob Client ID for HMAC signing | `your_client_id` |
| `BITNOB_CLIENT_SECRET` | Bitnob Client Secret for HMAC signing | `your_client_secret` |
| `BITNOB_WEBHOOK_SECRET`| Secret used to sign incoming webhook requests | `your_webhook_secret` |
| `SESSION_SECRET` | Salt key for HMAC session token signing | `change-me-in-production` |
| `AI_PROVIDER` | AI provider for Tekki (`gemini` or `ollama`) | `gemini` |
| `GEMINI_API_KEY` | Google AI Studio API key | `your_gemini_api_key` |
| `GEMINI_MODEL` | Gemini primary text model | `gemini-2.5-flash` |
| `OOLEL_TTS_URL` | Local Oolel Wolof TTS server endpoint | `http://127.0.0.1:8010` |

### 3. Initialize & Seed the Database
Seed the database with BRVM equities, community members, sample trades, and comments:
```bash
deno task db:seed
```
*To reset and re-seed cleanly at any time:*
```bash
deno task db:reset
```

### 4. Verify Bitnob Sandbox Connectivity
Test HMAC credentials, API keys, and whitelisted IP configuration against Bitnob:
```bash
deno task bitnob:check
```

### 5. Launch Development Servers
Open two terminal tabs:

**Terminal 1 (Backend API Service)**:
```bash
deno task server
```
Server runs at `http://0.0.0.0:8000`.

**Terminal 2 (Frontend with Vite HMR)**:
```bash
deno task dev
```
Development web application runs at `http://localhost:5173`.

*(Optional) Terminal 3 (Local Wolof Voice Server)*:
```bash
python tools/oolel/server.py
```

---

## Running in Production & PWA Mode

To test the exact production build with PWA service worker caching enabled:

```bash
# Builds frontend to app/dist and serves everything unified on port 8000
deno task start
```

Visit `http://localhost:8000`:
- **Android (Chrome)**: Tap the install prompt banner or menu `⋮` → **Install application**.
- **iOS (Safari)**: Tap the Share button → **Add to Home Screen**.
- **Desktop (Chrome/Edge/Brave)**: Click the install icon in the URL omnibox.

### Service Worker Cache Strategy
- **App Shell (`/`)**: Network-first with local cached shell fallback for rapid offline loading.
- **Static Assets (JS/CSS/Fonts/Icons)**: Cache-first strategy updated automatically upon new build hashes.
- **Financial APIs (`/api/*`)**: **Never cached**. Balances, real-time quotes, order executions, and Bitnob statuses always bypass the service worker.

---

## Automated Test Suites

TekkiTrade features rigorous automated tests covering domain logic, auth, calculations, and APIs:

```bash
deno task test
```

Test coverage includes:
- **Fees & Commissions**: AMF-UMOA, BRVM, DC/BR, and SGI tariff compliance.
- **Fractional Live Trading**: Fractional calculations, portfolio updates, and guest protection.
- **Paper Trading Engine**: Virtual fills, FIFO round-trips, realized/unrealized P&L.
- **Bitnob Funding & Settlement**: Quotes, corridor validations, and auto-crediting.
- **Authentication & Security**: PBKDF2 salt hashing, constant-time checks, and session tokens.
- **P2P Transfers**: Balance checks, recipient lookups, and ledger integrity.
- **Tekki AI Analytics & Guardrails**: Non-advisory filtering, FIFO trade metrics, and RAG retrieval.

---

## API Reference & Curl Examples

Below are representative HTTP endpoints implemented in `api/routes.ts` and `api/tekki/routes.ts`:

### 1. Authentication & Sessions

**Create a Guest Session**:
```bash
curl -s -X POST http://localhost:8000/api/auth/guest
```

**Register a Real Member (with pre-validated SGI account)**:
```bash
curl -s -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"awa@example.com","login":"awa_investor","password":"SecretPassword123"}'
```

**Authenticate / Login**:
```bash
curl -s -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login":"awa_investor","password":"SecretPassword123"}'
```

**Logout**:
```bash
curl -s -X POST http://localhost:8000/api/auth/logout \
  -H "Authorization: Bearer <TOKEN>"
```

### 2. BRVM Market Data & Fee Estimation

**Fetch All BRVM Equities (Live Delayed Quotes)**:
```bash
curl -s http://localhost:8000/api/market/stocks
```

**Estimate Fees for a Fractional Order**:
```bash
curl -s -X POST http://localhost:8000/api/estimate \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"symbol":"SNTS","side":"BUY","budgetFcfa":5000}'
```

### 3. Live SGI Trading & Paper Sandbox

**Execute Live Fractional Order (Routed to SGI)**:
```bash
curl -s -X POST http://localhost:8000/api/trade/live/orders \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"symbol":"SNTS","side":"BUY","budgetFcfa":5000}'
```

**Fetch Live SGI Portfolio**:
```bash
curl -s http://localhost:8000/api/trade/live/portfolio \
  -H "Authorization: Bearer <TOKEN>"
```

**Execute Paper Trading Order**:
```bash
curl -s -X POST http://localhost:8000/api/paper/orders \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"symbol":"ORAC","side":"BUY","shares":2}'
```

### 4. Bitnob Funding & Payout Rails

**Request Bitnob Payout Quote**:
```bash
curl -s -X POST http://localhost:8000/api/funding/quote \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"amountFcfa":5000,"asset":"USDC"}'
```

**Initialize Deposit Instruction**:
```bash
curl -s -X POST http://localhost:8000/api/funding \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"quoteId":"<QUOTE_ID>","senderName":"Awa Diop","senderCountry":"FR"}'
```

**Simulate Bitnob Sandbox Balance (Demo Walkthrough)**:
```bash
curl -s -X POST http://localhost:8000/api/funding/sandbox-balance \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"fundingId":"<FUNDING_ID>"}'
```

### 5. Peer-to-Peer (P2P) Internal Transfers

**Search Recipient by Handle**:
```bash
curl -s -X POST http://localhost:8000/api/users/lookup \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"query":"koffi_trader"}'
```

**Execute P2P Transfer**:
```bash
curl -s -X POST http://localhost:8000/api/transfers \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"recipientId":2,"amountFcfa":5000,"note":"Participation investissement"}'
```

**List Transfer History**:
```bash
curl -s http://localhost:8000/api/transfers \
  -H "Authorization: Bearer <TOKEN>"
```

### 6. Tekki AI & Speech Services

**Ask Tekki a Financial Question**:
```bash
curl -s -X POST http://localhost:8000/api/tekki/ask \
  -H "Content-Type: application/json" \
  -d '{"question":"Lan mooy Sonatel te lu tax njëg bi di soppiku ?","language":"wo"}'
```

**Get Objective Stock Analytics**:
```bash
curl -s -X POST http://localhost:8000/api/tekki/facts \
  -H "Content-Type: application/json" \
  -d '{"subject":{"type":"stock","symbol":"SNTS"}}'
```

---

## Demonstration Script & Pitch Guide

For hackathon presentations and evaluator walkthroughs, refer to our comprehensive documentation guides:
- [`docs/DEMO.md`](docs/DEMO.md): Complete 6-minute step-by-step stage script following *Awa* from Paris funding Sonatel on the BRVM via Bitnob.
- [`docs/GUIDE-TEST.md`](docs/GUIDE-TEST.md): 15-minute manual QA testing playbook.
- [`docs/DEPLOY.md`](docs/DEPLOY.md): Cloud deployment instructions for Brev.dev and container environments.

---

## Architectural Rules & Code Discipline

TekkiTrade strictly complies with internal architectural mandates:
1. **Preact Signals Engine**: All mutable state is owned by hoisted signal engines (`*-state.ts`). TSX components are strictly functional markup and one-line event triggers. No `useState` or component-scoped state.
2. **Decomposition Discipline**: Monolithic UI components are banned. Every view is built from atomic subcomponents (20–50 lines).
3. **Flat Contrast Palette**: Pure flat colors using Tailwind's `bg-base` shade hierarchy (`bg-base-100`, `bg-base-200`, `bg-base-300`). No gradients (except market sparklines), no borders, no box-shadows.
4. **Parameterized SQL**: All database operations use `@01edu/db` parameterized tagged templates (`sqlQuery` / `sql`) to prevent SQL injection vulnerabilities.
5. **Internationalization (i18n)**: All user-visible strings are loaded via `t.value` from `app/i18n/fr.ts` and `app/i18n/en.ts`.
