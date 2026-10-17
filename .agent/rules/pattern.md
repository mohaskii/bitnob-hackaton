---
trigger: always_on
---

# State Management Pattern — "Video-Game Style" Signals Architecture

> Reference implementation to learn from:
> `/home/loloskiiii/tournament/web/pages/playground.tsx`

The frontend manages state the way video games typically do: a global state
**engine** owns _all_ mutable state as signals, exposes hoisted actions, and the
UI is a set of thin, isolated components that only subscribe to the signals they
read. This gives fine-grained re-renders: a signal update only re-renders the
components that actually depend on it, nothing more.

**Why this matters:** naive component nesting causes every interaction to
re-render the whole page — including recomputing expensive derived data. The
engine + isolation rules below fix that at the architectural level.

---

## File Layout

```
<feature>-state.ts   # the "engine": signals + computeds + actions + effects
<feature>.tsx        # thin components (TSX + handlers only)
```

- Engine naming: `*-state.ts` (e.g. `product-state.ts`). One engine per
  feature/page; components import signals/actions from it.
- Pure, side-effect-free helpers (model building, formatting, data
  transformation) live in separate modules and never touch signals.
- The engine may import from pure modules, never the other way around.

---

## The 4 Core Rules

### Rule 1 — A signal for every piece of mutable data

Every mutable value is a `signal` (or a `computed` derived from signals). No
`useState`, no `useRef` for state, no plain mutable variables that the UI reads.
All state changes flow through signals so reactivity and traceability are
guaranteed.

**What counts as "mutable data" in a page:**

- async state: `loading`, `error`, fetched data
- user selections / inputs
- UI flags that affect rendering
- route/input parameters

```ts
export const loading = signal(false)
export const error = signal<string | null>(null)
export const data = signal<Data | null>(null)
export const selected = signal<Record<string, string>>({})
export const quantities = signal<Record<string, number>>({})
export const expanded = signal(true)
```

**❌ Anti-pattern:** component-scoped state via `useState` / `useRef`:

```tsx
const [selected, setSelected] = useState<number | null>(null) // ❌
const ref = useRef({ qty: 1 }) // ❌
```

These escape the signals system: they cannot be shared, traced, or driven by
effects, and they encourage nesting state inside components (see Rule 3).

**Update discipline:** signals holding objects/records are updated immutably —
always spread the previous value:

```ts
selected.value = { ...selected.value, [key]: value } // ✅
selected.value[key] = value // ❌ (no notify)
```

### Rule 2 — Derived state lives in `computed`

Anything that can be derived from other signals is a `computed` — evaluated
lazily, cached until its dependencies change, and subscribable by any component.
Components never compute derived data themselves.

```ts
export const totals = computed<number>(() =>
  Object.values(quantities.value).reduce((a, b) => a + b, 0)
)

export const filteredItems = computed<Item[]>(() => {
  const entries = Object.entries(selected.value)
  return items.value.filter((item) => {/* ... */})
})
```

**Why computeds are better than computing in render:**

1. **Cached** — `computed` re-runs only when its dependencies change. An
   unrelated re-render returns the cached value instead of recomputing.
2. **Subscription scoping** — a component that reads `someComputed.value`
   subscribes to exactly that computed, not to every signal underneath.
3. **Pure & testable** — derived logic lives at module scope, not inside a
   render function.

**Guideline:** if data can be derived from other signals, it belongs in a
`computed`. Filters, totals, availability, lookups, formatted views — all
computeds.

### Rule 3 — Fine-grained component isolation

Components subscribe ONLY to the signals they actually depend on (by reading
`.value` during render). If component B depends on signal `sB` and component A
depends on `sA`, B must NOT be nested inside A — extract B as its own component
so it re-renders independently of A's updates.

**Why:** when a component re-renders, its whole subtree re-renders (unless
memoized). If state-dependent leaves are nested inside a parent that reads a
different signal, the leaves get re-rendered for changes they don't care about.

```tsx
// ❌ B is nested inside A and re-renders on every sA change
const A = () => {
  const a = sA.value
  return (
    <>
      <div>{a}</div>
      <B />
    </>
  )
}

// ✅ B is isolated and only re-renders when sB changes
const A = () => {
  const a = sA.value
  return (
    <>
      <div>{a}</div>
      <B />
    </>
  )
}
const B = () => {
  const b = sB.value
  return <div>{b}</div>
}
```

A practical mapping: a selection click should not re-render the image gallery; a
quantity `+` click should not re-render the selection pills or recompute
availability.

**Note on `memo()`:** with signal subscriptions at the leaf components, you do
NOT need `memo()`. A component re-renders when a signal it read changes, and is
skipped otherwise. `memo` is a crutch for prop-drilling designs; this
architecture doesn't need it.

### Rule 4 — Components are TSX + event handlers only

No functions are declared inside a component. No logic, computations, or side
effects inside components. Components contain markup and one-line handlers that
call hoisted actions from the state engine.

**❌ Anti-pattern — logic inside a component:**

```tsx
const Panel = () => {
  const filtered = data.value.filter(item => { /* ... */ })  // ❌ re-runs every render
  const compute = (x) => { /* ... */ }                        // ❌ recreated every render
  return ( /* ... */ )
}
```

**✅ Correct — hoist logic to the engine:**

```ts
// engine (hoisted, module scope)
export const toggleValue = (key: string, value: string) => {
  selected.value = { ...selected.value, [key]: value }
}

// pure helper used by computeds
const findItem = (id: string) => data.value?.items.find((i) => i.id === id)
```

Small inline arrow handlers (`() => toggleValue(...)`) are acceptable — they are
event handlers that trigger signal updates. Anything heavier (filtering,
mapping, math, async) must be a module-level function or computed.

### Rule 5 — Isolated, Fine-Grained Subcomponents (Decomposition Discipline)

Never build monolithic pages, complex dialogs, or sections as single giant
components. Every view, dialog, or section must be decomposed into dedicated,
named, fine-grained subcomponents.

**Why this matters:**

- **Re-render isolation**: Narrow leaf components subscribe only to their
  specific signals, preventing unnecessary re-renders of the surrounding UI.
- **Readability & maintainability**: 20-40 line components with clear names are
  effortless to test, style, and debug compared to 200+ line JSX monoliths.
- **Visual agility**: Tweaking one subcomponent (e.g. a toggle switch, badge, or
  button) does not risk breaking or cluttering unrelated layout code.

**Guidelines for Decomposition:**

1. **Target size**: Subcomponents should be compact (~20 to 50 lines). Any
   component approaching 80+ lines must be evaluated for decomposition.
2. **Atomic component roles**:
   - **Headers / Branding**: `ModalHeader`, `OrderCardHeader`, `HeroTitle`,
     `PageHeading`
   - **Inputs / Controls**: `SearchInput`, `StatusFilterSelect`, `QtyStepper`,
     `SwitchToggle`
   - **Feedback / Alerts**: `ModalAlerts`, `InlineErrorBanner`, `PendingAlerts`
   - **Action Bars / Footers**: `ModalActions`, `StickyActionBar`,
     `CardBottomRow`
   - **Cards / Rows**: `ProductThumbnail`, `ItemRow`, `DurationOptionItem`
   - **Assembler / Orchestrator**: The root component or page is a thin layout
     orchestrator that stitches together the subcomponents.
3. **Dedicated feature/dialog files**: When a dialog or feature has multiple
   subcomponents (like `wallet-modal.tsx`), isolate it into its own dedicated
   file rather than inflating page routers or dashboard layouts.
4. **Descriptive semantic naming**: Never use cryptic or generic names like
   `Sec1`, `Sec2`, `PartA`, `Box1`. Use domain-specific names (`HeroSection`,
   `PlatformsGrid`, `ExtendStorageModal`, `ServicesModalBody`).
5. **Zero functions in components**: Handlers remain simple one-line calls to
   hoisted functions (`onClick={openModal}` or `onClick={() => select(id)}`).

---

## Side Effects live at Module Level (`effect`)

Use `effect()` at module scope for side effects driven by signals, not
`useEffect` in components. Effects that write state must guard themselves so
they stay idempotent (write only signals they don't read).

```ts
// Data change → reset dependent state. Reads data; writes the selection
// signals — no loop because it never reads what it writes.
effect(() => {
  const d = data.value
  if (!d) return
  selected.value = preselect(d)
  quantities.value = {}
  expanded.value = true
})

// Route/input → fetch. Idempotent: setting the same value is a no-op, so
// a re-render or a double effect cannot trigger a duplicate request.
const currentInput = signal<string | null>(null)
export const start = (input: string) => {
  if (currentInput.value === input) return
  currentInput.value = input
}
effect(() => {
  const input = currentInput.value
  if (input) fetchData(input)
})
```

**The one acceptable `useEffect`:** the page entry point may use a tiny mount
effect that just calls a hoisted action:

```tsx
export const Page = ({ input }: { input: string }) => {
  useEffect(() => start(input), [input])
  return ( /* reads loading / error / data */ )
}
```

This is a _trigger_, not logic — the actual work is an engine function.

---

## Actions — the only way state changes

All user interactions funnel through hoisted action functions in the engine.
They may update several signals at once (that's fine — signals batch
notifications within a single synchronous action).

```ts
export const setActive = (id: string) => {
  active.value = id
}

export const select = (key: string, value: string) => {
  selected.value = { ...selected.value, [key]: value }
  const item = findItem(value)
  if (item?.image) active.value = item.image // side effects live in actions too
}

export const setQuantity = (key: string, qty: number) => {
  quantities.value = { ...quantities.value, [key]: qty }
}
```

Naming convention: actions are verbs (`select`, `toggle`, `setQuantity`, `load`,
`retry`, `start`).

---

## Pure logic helpers (no signals)

Anything that transforms data without touching state lives as a pure
module-level function or in a pure module. Pure modules import no signals.

```ts
// pure module — no signal imports at all
export const buildModel = (raw: RawData): Model | null => {/* ... */}
export const preselect = (model: Model): Record<string, string> => {/* ... */}

// engine — pure helper used by computeds
const findItem = (id: string): Item | undefined => {/* ... */}
```

---

## Internationalization Architecture (`i18n`)

All user-visible strings must be localized through the `@preact/signals`
reactive i18n engine located in `frontend/i18n/`. Never hardcode user-facing
text strings directly in TSX components.

### 1. Structure

- `frontend/i18n/types.ts`: Strict `TranslationSchema` interface ensuring 1:1
  key and type parity between French (`fr`) and English (`en`).
- `frontend/i18n/fr.ts`: French dictionary.
- `frontend/i18n/en.ts`: English dictionary.
- `frontend/i18n/index.tsx`: Reactive state engine exporting `lang`, `t`,
  `setLang`, `toggleLang`, and the `LanguageSwitcher` component.

### 2. Reactivity & Consumption

The active translation dictionary is exposed as a signal computed:

```ts
export const t = computed<TranslationSchema>(() =>
  lang.value === 'en' ? en : fr
)
```

Components simply import `t` and read the property directly in render:

```tsx
import { t } from '../i18n/index.tsx'

const SearchButton = () => (
  <button type='submit' class='btn btn-primary'>
    {t.value.home.searchButton}
  </button>
)
```

When `lang.value` changes (e.g. via `LanguageSwitcher`), all fine-grained leaf
components reading `t.value.<namespace>.<key>` re-render instantly without page
reloads.

### 3. Dynamic Formatting Helpers

For strings with parameters (counts, amounts, names), define pure helper
functions in `TranslationSchema`:

```ts
// types.ts
export interface TranslationSchema {
  cart: {
    selectedArticles: (count: number) => string
    // ...
  }
}

// fr.ts
selectedArticles: (count) => `${count} article${count > 1 ? 's' : ''} sélectionné${count > 1 ? 's' : ''}`,

// en.ts
selectedArticles: (count) => `${count} item${count > 1 ? 's' : ''} selected`,

// Component usage:
<span>{t.value.cart.selectedArticles(count)}</span>
```

---

## Checklist when adding UI to the frontend

- [ ] Every new piece of state is a `signal` in the engine (or a `computed`)
- [ ] No `useState` / component-scoped refs for state
- [ ] No functions defined inside components — hoist to the engine module
- [ ] No logic/computations inside components — read `computed`s instead
- [ ] Components subscribe only to the signals they need; split components that
      depend on different signals so they re-render independently
- [ ] Side effects use module-level `effect()`, not component `useEffect` (page
      entry mount effect that just triggers an action is OK)
- [ ] Signal objects updated immutably (spread), never mutated in place
- [ ] All user-facing strings added to `frontend/i18n/types.ts`, `fr.ts`,
      `en.ts` and read via `t.value`
- [ ] After adding state, verify re-render scope: changing a signal should only
      re-render the components that read it
- [ ] Large components/dialogs decomposed into isolated, fine-grained
      subcomponents (~20-50 lines each)
- [ ] No cryptic component names (`Sec1`, `Sec2`); use semantic names
- [ ] **No gradients**: Never use gradients (`bg-gradient-*`, `radial-gradient`, etc.). Use flat background colors.
- [ ] **No borders**: Never add borders or rings (`border`, `ring-*`) unless explicitly requested by the user.
- [ ] **Contrast via `bg-base` shades**: Use `bg-base-100`, `bg-base-200`, `bg-base-300` hierarchy for depth and separation (e.g. `bg-base-200` inputs inside a `bg-base-100` card).
- [ ] **No shadows**: Never use box shadows (`shadow-*`, `box-shadow`, etc.).

## Common mistakes to avoid

1. **Reading a signal in a parent "just to make it reactive"** — this re-renders
   the whole subtree. Read it in the leaf that displays it.
2. **Computing derived data inside render** (filters, availability) — put it in
   a `computed` so it's cached and re-render-independent.
3. **Mutating signal values in place** — always replace the object:
   `{ ...prev, [k]: v }`.
4. **Component-scoped selection state** (`useState`/`useRef`) — you lose the
   ability to reset from a module-level `effect` on data change.
5. **Inline heavy logic in `onClick`** — move it to an action function.
6. **Forgetting idempotency guards on `effect`s that write state** — an effect
   that writes a signal it also reads will loop.
7. **Hardcoding strings in JSX** — always add to `frontend/i18n/` and use
   `t.value`.
8. **Monolithic JSX trees (>80 lines in a single component)** — break out
   dedicated subcomponents for headers, controls, cards, alerts, and actions.
9. **Using borders or shadows for separation** — always use `bg-base` color contrast instead.
10. **Using gradients** — stick strictly to solid, flat backgrounds.

