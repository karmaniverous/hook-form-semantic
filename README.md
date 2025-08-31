# React Component Library Template (TypeScript)

> A fast, minimal, batteries‑included starter for React 18 component libraries.

This template gives you a production‑ready foundation to build and publish React
components with TypeScript. It prioritizes a smooth developer experience (DX)
with fast feedback, predictable builds, and clear test and lint ergonomics.

What you get out of the box

- React 18 + TypeScript (react‑jsx runtime)
- ESM‑only bundling with Rollup (react and react‑dom externalized)
- Type declarations (.d.ts) bundled via rollup-plugin-dts
- Vitest + @testing-library/react + jest‑dom (happy‑dom env)
- Vite playground for live browser testing (HMR)
- TypeScript ESLint flat config (no project parser friction)
- Prettier formatting
- TypeDoc for API documentation
- Release tooling (release-it), optional lefthook Git hooks
- Peer dependencies: react, react‑dom (>=18); sideEffects: false

Contents

- Getting Started
- Develop React components
- Test your components
- View in the browser (Vite playground)
- Build and publish
- Linting & formatting
- Type checking
- API docs with TypeDoc
- FAQ and tips

---

## Getting Started

Prerequisites

- Node.js 20+ (recommended). If you use node >= 20.6, see the lint note under
  “Linting & formatting” about “--import tsx”.

Install and initialize

```bash
npm install
npx lefthook install   # optional Git hooks (branch naming, etc.)
```

Run tests and type checks to verify your environment

```bash
npm run test
npm run typecheck
npm run build
npm run docs
```

Start the browser playground (HMR)

```bash
npm run dev
# opens http://localhost:5173 (by default)
```

---

## Develop React components

Structure

- Put components in src/components.
- Export public surface from src/index.ts.

Example: a simple HelloWorld component (already included)

```tsx
// src/components/HelloWorld.tsx
export type HelloWorldProps = { who?: string };

export function HelloWorld({ who = 'World' }: HelloWorldProps): JSX.Element {
  return <div>Hello {who}</div>;
}
```

Re-export in your library entry

```ts
// src/index.ts
export { HelloWorld, type HelloWorldProps } from './components/HelloWorld';
```

Consume from another app after publishing

```tsx
import { HelloWorld } from '@your-scope/react-component-template';

export default function App() {
  return <HelloWorld who="React" />;
}
```

---

## Test your components

This template uses:

- Vitest (happy‑dom)
- @testing-library/react
- jest‑dom (registered via vitest.setup.ts)

Add tests alongside components (co‑located)

```tsx
// src/components/HelloWorld.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HelloWorld } from './HelloWorld';

describe('HelloWorld', () => {
  it('renders default greeting', () => {
    render(<HelloWorld />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('renders custom greeting', () => {
    render(<HelloWorld who="Developer" />);
    expect(screen.getByText('Hello Developer')).toBeInTheDocument();
  });
});
```

Run tests (with coverage)

```bash
npm run test
```

Notes

- The test environment is happy‑dom for speed and stability. You can switch to
  jsdom later if needed.
- Vitest excludes stale compiled tests from .rollup.cache.

- Also verify your library entry (src/index.ts) re-exports what you intend.
  A tiny test can import from the library entry instead of deep paths:

```tsx
// src/index.test.tsx
import { render, screen } from '@testing-library/react';
import { HelloWorld } from './index';

it('re-exports HelloWorld', () => {
  render(<HelloWorld who="Library" />);
  expect(screen.getByText('Hello Library')).toBeInTheDocument();
});
```

- Coverage scope: docs/, dist/, and playground/ are excluded in
  vitest.config.ts so coverage focuses on your source. Adjust
  test.coverage.exclude as needed if you want to include or exclude
  additional paths.

---
## View in the browser (Vite playground)

A minimal playground is included under playground/ for fast, local viewing with
HMR. It imports your components directly from src (no publishing required).

Commands

```bash
npm run dev       # start Vite dev server for the playground
npm run preview   # preview a production build of the playground
```

Where to edit

- playground/src/App.tsx: Import and render your components from ../../src.
- playground/index.html and playground/vite.config.ts are already wired.

Publishing note

- The playground is excluded from your npm package (files: ["dist"]).

---

## Build and publish

Build the library

```bash
npm run build
```

Outputs

- dist/mjs/\*\* for ESM modules (preserveModules enabled)
- dist/index.d.ts for types

Externalized

- react, react-dom, and react/jsx-runtime are marked external and must be
  installed by consumers. They are listed as peerDependencies and devDependencies
  here for DX.

ESM only

- This template ships ESM only (no CJS/IIFE). Most modern toolchains support
  this directly. If you need CJS, add a second Rollup target.

Release flow (optional)

- release-it is configured to run lint/test/knip/build, generate changelog, and
  publish to npm + GitHub releases.

---

## Linting & formatting

This template uses a TypeScript ESLint flat config in eslint.config.ts with:

- ESLint recommended + TypeScript recommended (non type‑checked)
- Vitest recommended rules for test files
- Prettier integration
- simple-import-sort and basic TSDoc checks

Run lint

```bash
npm run lint
npm run lint:fix
```

Node 20.6+ note

- If you see “tsx must be loaded with --import instead of --loader”, update the
  lint scripts to:

```json
{
  "lint": "node --import tsx ./node_modules/eslint/bin/eslint.js .",
  "lint:fix": "node --import tsx ./node_modules/eslint/bin/eslint.js --fix ."
}
```

(Your current scripts may already work depending on Node version.)

---

## Type checking

TypeScript runs in check‑only mode (no emit):

```bash
npm run typecheck
```

Scoping

- Type checks focus on src/\*\* and test setup. Playground and test files are
  excluded from typecheck to keep the build/docs pipeline friction‑free.

---

## API docs with TypeDoc

Generate docs from your TSDoc comments

```bash
npm run docs
```

Output is written to docs/. You can host this via GitHub Pages or your preferred
static host. Additional behavior is configured in typedoc.json.

---

## FAQ and tips

- Why ESM only?
  - Simpler outputs and smaller surface area. Add a CJS target in Rollup if you
    must support CJS consumers.
- Where do I put styles?
  - This template ships “sideEffects: false” and no CSS by default. Add your own
    styling approach (CSS modules, CSS‑in‑JS, etc.) per component need.
- How do I add more components?
  - Create new files under src/components, export from src/index.ts, add tests,
    and render them in the playground during development.
- Can I use Storybook or Ladle?
  - Yes — add it later if you need richer component docs/demos. The Vite
    playground keeps things minimal to start.

---

## Status & readiness

- Build, docs, and typecheck pass.
- Tests pass with Vitest + Testing Library.
- Lint is configured with a TS flat config; if you’re on Node ≥ 20.6, consider
  switching lint scripts from “--loader tsx” to “--import tsx” (see above).
- For a typical React 18 component workflow, this template is ready to use.

---

Built for you with ❤️ on Bali! Find more great tools & templates on [my GitHub Profile](https://github.com/karmaniverous).

