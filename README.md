# No Waste No Pain

A minimal, mobile-first paycheck budget planner built with Astro and TypeScript. It lets you give each paycheck its own set of categories, enter budgets as money or percentages, and copy the result as a Markdown table for a notes app.

## Features

- Independent budgets for each paycheck
- Fixed-amount and percentage-based categories
- Live dollar and percentage equivalents
- Per-paycheck leftover and planned-total indicators
- Add, disable, or remove categories and paycheck plans
- Copy every plan as plain text or clean Markdown
- Responsive dark glassmorphism interface
- Fully local: budget data never leaves the browser

## Run locally

Requirements: Node.js 22.12 or newer and pnpm.

```sh
pnpm install
pnpm dev
```

Open [http://localhost:4321](http://localhost:4321).

For the repository's background development workflow:

```sh
pnpm astro dev --background
pnpm astro dev status
pnpm astro dev logs
pnpm astro dev stop
```

## Commands

| Command | Purpose |
| :-- | :-- |
| `pnpm dev` | Start the development server |
| `pnpm build` | Create a production build in `dist/` |
| `pnpm preview` | Preview the production build |

## Project structure

```text
src/
├── components/       Astro UI components
├── data/budget.ts    Default plans and shared types
├── pages/index.astro Page composition
├── scripts/budget.ts Client-side budget behavior
└── styles/global.css Design system and responsive styles
```

## Git flow

Development happens on `dev`. Stable work is merged into `main`.
