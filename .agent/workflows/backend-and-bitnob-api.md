# Backend Architecture & Bitnob API Integration Workflow

This workflow documents the architecture, database layer, routing and validation patterns, and Bitnob payment integration adapted from `/home/mohaskiiii/tournament`.

---

## 1. Stack & Architecture Overview

The backend uses Deno with standard 01-edu infrastructure packages:
- **Routing & HTTP Server**: `@01edu/api/router` (`makeRouter`, `route`) and `@01edu/api/server`.
- **Validation**: `@01edu/api/validator` (`STR`, `NUM`, `BOOL`, `OBJ`, `ARR`, `optional`, `UNION`).
- **Database**: SQLite managed through `@01edu/db` (`createTable`, `db`, `sql`) with parameterized queries.
- **Payment & Fintech Rails**: Bitnob API Client (`api/bitnob/client.ts`) covering Bitcoin Lightning, USDT, Mobile Money payouts (Wave / Orange Money), Virtual Visa Cards, and HMAC-SHA512 webhooks.

```
api/
├── bitnob/
│   ├── client.ts         # Bitnob REST client with resilient sandbox fallback
│   └── webhook.ts        # HMAC-SHA512 webhook handler & SQLite ledger reconciliation
├── lib/
│   ├── env.ts            # Environment variables loader
│   └── log.ts            # @01edu/api/log instance
├── routes.ts             # Route definitions with @01edu/api/validator
├── schema.ts             # SQLite tables (createTable) & parameterized sqlQuery
├── server.ts             # HTTP server entrypoint (Deno.serve)
└── task-seed.ts          # Database seeder (demo user, BRVM stocks, traders, posts)
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
  password: { type: 'BLOB' },
  bitnobCustomerId: { type: 'TEXT', optional: true },
  createdAt: { type: 'REAL' },
})
```

### Parameterized SQL Tag (`sqlQuery`)
`@01edu/db`'s raw `sql` uses `String.raw` which concatenates strings directly without quoting. To prevent syntax errors with strings and prevent SQL injection, `sqlQuery` safely transforms interpolated template strings into `?` placeholders and binds variables to `db.prepare()`:

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
      args.length
        ? stmt.run(...(args as any[]))
        : stmt.run(...(values as any[])),
    value: (...args: unknown[]) =>
      args.length
        ? stmt.value(...(args as any[]))
        : stmt.value(...(values as any[])),
  }
}

export const sql = sqlQuery
```

### Type Derivation from Validator Schemas (No `interface`)
In accordance with codebase standards, `interface` is entirely eliminated in favor of `type`. Data payload types are derived directly from `@01edu/api/validator` schemas using `InferSchema<typeof Schema>`:

```ts
export const BitnobCustomerInputSchema = OBJ({
  email: STR('Customer email address'),
  firstName: STR('Customer first name'),
  lastName: STR('Customer last name'),
  phone: optional(STR('Customer phone number')),
  countryCode: optional(STR('Default SN or CI')),
})
export type BitnobCustomerInput = InferSchema<typeof BitnobCustomerInputSchema>
```

---

## 3. Route & Validator Pattern (`api/routes.ts`)

Every route defines:
1. `authorize` (optional): Authenticates the session.
2. `input` (optional): Schema defined with `@01edu/api/validator`.
3. `output`: Return shape contract.
4. `fn`: Async business handler returning `respond.OK(...)` or throwing typed errors (`respond.BadRequestError`, `respond.NotFoundError`, `respond.UnauthorizedError`).

```ts
'POST/api/market/order': route({
  authorize: withUserSession,
  fn: (ctx, { symbol, action, amountFcfa }) => {
    const { userId } = ctx.session!
    // 1. Fetch stock price
    const stock = sqlQuery<{ priceFcfa: number }>`
      SELECT priceFcfa FROM stock WHERE symbol = ${symbol}
    `.all()[0]

    if (!stock) throw new respond.NotFoundError({ message: 'Stock not found' })

    // 2. Fractional share computation
    const sharesFilled = Number((amountFcfa / stock.priceFcfa).toFixed(4))

    // 3. Atomically debit wallet and insert order
    // ...
    return respond.OK({ symbol, action, amountFcfa, sharesFilled, status: 'COMPLETED' })
  },
  input: OBJ({
    symbol: STR('Stock symbol'),
    action: STR('Order action'),
    amountFcfa: NUM('Capital to invest'),
  }),
  output: OBJ({
    orderId: NUM(),
    symbol: STR(),
    action: STR(),
    amountFcfa: NUM(),
    sharesFilled: NUM(),
    status: STR(),
  }),
})
```

---

## 4. Bitnob Integration Rails

### Vectors Implemented
1. **Bitcoin Lightning Network**: `POST /api/wallet/deposit/lightning` creates dynamic bolt11 invoices via `/wallets/ln/createinvoice`.
2. **USDT On-chain Deposits**: `POST /api/wallet/deposit/usdt` generates dedicated TRC-20 or ERC-20 addresses via `/addresses/generate`.
3. **Mobile Money Payouts**: `POST /api/wallet/withdraw/momo` converts trading gains and dividend profits into direct Wave / Orange Money cashouts via `/payouts`.
4. **Virtual Visa Cards**: `POST /api/cards/create` issues Visa cards via `/cards` for spending investment profits online.
5. **Webhooks & Auto-Settlement**: `POST /api/bitnob/webhook` verifies HMAC-SHA512 signature against `x-bitnob-signature` and atomically credits the user's SQLite wallet.

---

## 5. Running the Backend Tasks

```bash
# Seed SQLite Database with demo user (ID 1, 209 890 FCFA) & BRVM stocks
deno task db:seed

# Start the API server on port 8000
deno task server

# Run complete TypeScript check
deno check api/server.ts api/routes.ts api/schema.ts api/bitnob/client.ts api/bitnob/webhook.ts api/task-seed.ts
```

---

## 6. Typing Boundary: Backend vs Frontend

- **Backend (`api/`)**: Directly leverages `jsr:@01edu/api/validator` (`OBJ`, `STR`, `NUM`, `BOOL`, `ARR`, `optional`, `LIST`) for runtime endpoint validation and typed request/response inference via `@01edu/api/router`.
- **Frontend (`app/`)**: Bundled by Vite for client-side and mobile runtime. To avoid bundler resolution issues with JSR backend packages in Vite client mode, frontend state models are defined using pure TypeScript `type` definitions (maintaining the **0 interface** rule). Frontend components communicate with the backend via standard REST JSON contracts.

