# Backend Architecture & Bitnob API Integration Workflow

This workflow documents the architecture, database layer, routing, and Bitnob payment integration powering **TekkiTrade**.

---

## 1. Stack & Architecture Overview

The backend uses Deno with standard 01-edu infrastructure packages:
- **Routing & HTTP Server**: `@01edu/api/router` (`makeRouter`, `route`) and `@01edu/api/server`.
- **Validation**: `@01edu/api/validator` (`STR`, `NUM`, `BOOL`, `OBJ`, `LIST`, `optional`).
- **Database**: SQLite managed through `@01edu/db` (`createTable`, `db`, `sql`) with parameterized queries and atomic transactions (`withTransaction`).
- **Real Market Data**: `api/market-data.ts` scrapes delayed quotes directly from official `brvm.org` (48 listed companies) with SQLite caching.
- **Payment & Bitnob Rails**: Bitnob API Client (`api/bitnob/client.ts`) covering Bitcoin Lightning (BOLT11), Stablecoins (USDT, USDC on EVM/Sepolia), Mobile Money payouts (CI, SN, NE), and HMAC-SHA512 verified webhooks.
- **Domain Logic (`api/domain/`)**: Regulatory fees calculation (`fees.ts`), Paper trading simulation (`paper.ts`), SGI partners catalog and KYC onboarding (`sgi.ts`, `journey.ts`), and Funding orchestration (`funding.ts`).

```
api/
├── bitnob/
│   ├── client.ts         # Real Bitnob REST client with HMAC-SHA512 & simulation fallback
│   └── webhook.ts        # Verified idempotent Bitnob webhook handler
├── domain/
│   ├── companies.ts      # Profiles of 47 BRVM listed companies
│   ├── domain_test.ts    # Comprehensive unit tests for financial math & domain rules
│   ├── fees.ts           # BRVM 0.20%, DC/BR 0.10%, SGI brokerage & VAT
│   ├── funding.ts        # Bitnob deposits & SGI escrow payouts
│   ├── journey.ts        # Account opening checklist & SGI pipeline
│   ├── paper.ts          # Paper portfolio with PRU & atomic transactions
│   └── sgi.ts            # SGI partner catalogue & fee schedules
├── lib/
│   ├── auth.ts           # Salted PBKDF2 password hashing & HMAC session tokens
│   ├── env.ts            # Environment loader (BITNOB_MODE, DB path, secrets)
│   └── log.ts            # @01edu/api/log instance
├── market-data.ts        # Official BRVM delayed quotes scraper & price history
├── routes.ts             # Route definitions with @01edu/api/validator
├── schema.ts             # SQLite schema (User, Portfolio, Orders, Funding, Social)
├── server.ts             # HTTP server entrypoint (Deno.serve)
├── task-bitnob-check.ts  # Verification task for Bitnob sandbox credentials
├── task-reset.ts         # Database reset & initialization
└── task-seed.ts          # Database seeder (warm BRVM cache, example traders & posts)
```

---

## 2. Database Schema & Parameterized Queries Pattern

### Table Creation (`api/schema.ts`)
Tables are declared using `createTable` from `@01edu/db`:
```ts
import { createTable, db, type Row } from '@01edu/db'

export const User = createTable('user', {
  userId: { type: 'INTEGER', primary: true },
  email: { type: 'TEXT' },
  login: { type: 'TEXT' },
  phone: { type: 'TEXT', optional: true },
  passwordHash: { type: 'BLOB' },
  passwordSalt: { type: 'BLOB' },
  isGuest: { type: 'INTEGER' },
  bitnobCustomerId: { type: 'TEXT', optional: true },
  createdAt: { type: 'REAL' },
})
```

### Parameterized SQL Tag (`sqlQuery`)
`sqlQuery` safely transforms interpolated template strings into `?` placeholders and binds variables to `db.prepare()`:
```ts
export const sqlQuery = <
  R extends { [x: string]: unknown } | undefined = Record<string, unknown>,
>(
  strings: TemplateStringsArray,
  ...values: unknown[]
) => {
  const query = strings.join('?')
  const stmt = db.prepare(query)
  return {
    get: (...args: unknown[]) =>
      (args.length
        ? stmt.get(...(args as any[]))
        : stmt.get(...(values as any[]))) as R | undefined,
    all: (...args: unknown[]) =>
      (args.length
        ? stmt.all(...(args as any[]))
        : stmt.all(...(values as any[]))) as R[],
    run: (...args: unknown[]) =>
      (args.length
        ? stmt.run(...(args as any[]))
        : stmt.run(...(values as any[]))),
    value: (...args: unknown[]) =>
      (args.length
        ? stmt.value(...(args as any[]))
        : stmt.value(...(values as any[]))),
  }
}

export const sql = sqlQuery
```

---

## 3. Bitnob Integration Rails

### Real Bitnob Endpoints Implemented
1. **Payout Quotes**: `POST /api/funding/quote` calls Bitnob's `/api/payouts/quotes` to lock in the crypto amount and rate (FCFA/USDT, FCFA/BTC).
2. **Lightning Network & Stablecoins**: `POST /api/funding` generates BOLT11 invoices or EVM on-chain deposit addresses via Bitnob.
3. **Mobile Money Payouts to SGI**: Bitnob payouts automatically route XOF to the collection wallet of the partner SGI in Côte d'Ivoire, Senegal, or Niger.
4. **Idempotent Webhooks**: `POST /api/bitnob/webhook` verifies HMAC-SHA512 signatures and credits the user's account safely.
5. **Simulation Mode**: If API keys are empty in `.env`, runs in `simulation` mode with zero crashes.

---

## 4. Running Backend Tasks & Tests

```bash
# Reset & seed SQLite database with warmed BRVM quotes & example data
deno task db:reset

# Seed database
deno task db:seed

# Run domain unit tests
deno task test

# Check Bitnob sandbox credentials & corridor quotes
deno task bitnob:check

# Start API server on port 8000
deno task server
```

---

## 5. Frontend Integration (`app/lib/api.ts`)

Components and state engines (`*-state.ts`) import the lightweight `api` client:
```ts
import { api } from '../../lib/api.ts'

// Fetch live BRVM market stocks
const data = await api.get<MarketSnapshot>('/market/stocks')

// Create a real Bitnob funding request
const res = await api.post('/funding', { asset: 'USDT', amountFcfa: 50000 })
```
