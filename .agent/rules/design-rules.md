# UI & Styling Design System Rules

These styling rules apply to the entire frontend codebase and MUST be strictly respected in all components, screens, and styles:

---

## 1. Zero Gradients (`no gradien`)
- **NEVER** use gradients of any kind.
- Do NOT use Tailwind classes like `bg-gradient-to-*`, `from-*`, `via-*`, `to-*`.
- Do NOT use CSS `radial-gradient()`, `linear-gradient()`, or `conic-gradient()`.
- Always use solid, flat background colors (e.g. `bg-neutral`, `bg-base-100`, `bg-base-200`, `bg-base-300`, `bg-primary`, etc.).

---

## 2. Zero Borders Unless Explicitly Instructed (`no border`)
- **NEVER** add borders unless explicitly requested by the user.
- Do NOT use `border`, `border-t`, `border-b`, `border-l`, `border-r`, `border-base-*`, etc.
- Do NOT use `ring`, `ring-1`, `ring-2`, `ring-white/*`, `divide-*`, or outline borders.
- Visual separation and structure MUST be achieved through geometry, spacing, and **background color contrast** instead of lines and outlines.

---

## 3. Contrast via `bg-base` Shades (`bg-base-100` / `bg-base-200` / `bg-base-300`)
- Contrast between surfaces, cards, inputs, and controls is created strictly using the `bg-base` palette:
  - **Screen / Page canvas**: typically `bg-base-200`
  - **Cards / Containers**: `bg-base-100`
  - **Form Inputs / Controls inside `bg-base-100`**: use `bg-base-200` (or `bg-base-300`) with no borders and no shadows
  - **Inputs inside `bg-base-200`**: use `bg-base-100`
  - **Hover / Active states**: use one step deeper shade (e.g., `hover:bg-base-300`)
- This creates clean, accessible visual hierarchy without visual clutter.

---

## 4. Zero Shadows (`no shadow`)
- **NEVER** use box shadows.
- Do NOT use Tailwind classes like `shadow`, `shadow-xs`, `shadow-sm`, `shadow-md`, `shadow-lg`, `shadow-xl`, `shadow-2xl`, `shadow-inner`, `drop-shadow-*`.
- Do NOT use CSS `box-shadow` in custom styles or animations.
- The UI is purely flat, modern, and sharp.
