> **_A modern, batteries‑included React 18 component library template for TypeScript with ESM‑only bundling, Vite playground, Vitest, ESLint/Prettier, TypeDoc, release‑it, STAN, and optional cloud backup._**

# React Component Library Template (TypeScript)

> 👇 NPM & Node Current badges will be activated when you publish your component to NPM!

[![npm version](https://img.shields.io/npm/v/@karmaniverous/react-component-npm-package-template-ts.svg)](https://www.npmjs.com/package/@karmaniverous/react-component-npm-package-template-ts) ![Node Current](https://img.shields.io/node/v/@karmaniverous/react-component-npm-package-template-ts) <!-- TYPEDOC_EXCLUDE --> [![docs](https://img.shields.io/badge/docs-website-blue)](https://docs.karmanivero.us/react-component-npm-package-template-ts) [![changelog](https://img.shields.io/badge/changelog-latest-blue.svg)](https://github.com/karmaniverous/react-component-npm-package-template-ts/tree/main/CHANGELOG.md)<!-- /TYPEDOC_EXCLUDE --> [![license](https://img.shields.io/badge/license-BSD--3--Clause-blue.svg)](https://github.com/karmaniverous/react-component-npm-package-template-ts/tree/main/LICENSE.md)

This template gives you a production‑ready foundation to build and publish React components with TypeScript. It prioritizes a smooth developer experience (DX) with fast feedback, predictable builds, and clear test and lint ergonomics.

What's in the box:

- ⚛️ React 18 + TypeScript (react‑jsx runtime)
- 📦 ESM‑only bundling with Rollup (react and react‑dom externalized)
- 🧾 Type declarations (.d.ts) via rollup‑plugin‑dts
- ✅ Vitest + React Testing Library + jest‑dom (happy‑dom env)
- ⚡ Vite playground for live browser testing (HMR)
- 🧹 ESLint flat config (TypeScript) + simple‑import‑sort
- ✨ Prettier formatting
- 📚 TypeDoc for API documentation
- 🚀 release‑it for releases (optional Lefthook Git hooks)
- 🤖 STAN — AI‑assisted refactoring & patch workflow
- ☁️ GitHub Actions cloud sync backup (Rclone)
- 🧩 Peer dependencies: react, react‑dom (>=18); sideEffects: false

## Contents

- [In The Box](#in-the-box)
- [How to use this template](#how-to-use-this-template)
- [Getting Started](#getting-started)
- [Develop React components](#develop-react-components)
- [Test your components](#test-your-components)
- [View in the browser (Vite playground)](#view-in-the-browser-vite-playground)
- [Build and publish](#build-and-publish)
- [Linting & formatting](#linting--formatting)
- [Type checking](#type-checking)
- [API docs with TypeDoc](#api-docs-with-typedoc)
- [FAQ and tips](#faq-and-tips)

---

## In The Box

Delightful defaults with modern tooling — batteries included, no drama.

### ⚛️ React 18 + TypeScript (react‑jsx runtime)

- React: https://react.dev
- TypeScript JSX options (react‑jsx automatic runtime): https://www.typescriptlang.org/docs/handbook/jsx.html
- New JSX Transform (background): https://legacy.reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html

### 📦 ESM‑only bundling with Rollup

- Rollup (bundler): https://rollupjs.org
- Externalized: `react`, `react-dom`, and `react/jsx-runtime` (smaller bundles; consumers bring their own React)

### 🧾 Type declarations (.d.ts) via rollup‑plugin‑dts

- rollup‑plugin‑dts: https://github.com/Swatinem/rollup-plugin-dts
- Ships `dist/index.d.ts` for consumers and API docs

### ✅ Testing: Vitest + Testing Library + jest‑dom (happy‑dom)

- Vitest: https://vitest.dev
- React Testing Library: https://testing-library.com/docs/react-testing-library/intro/
- jest‑dom matchers: https://testing-library.com/docs/ecosystem-jest-dom/
- happy‑dom (fast, stable DOM env): https://github.com/capricorn86/happy-dom

### ⚡ Vite playground (HMR)

- Vite: https://vite.dev
- Local dev playground under `/playground` for instant feedback without publishing

### 🧹 ESLint flat config (TypeScript) + simple‑import‑sort

- ESLint “flat” config: https://eslint.org/docs/latest/use/configure/configuration-files
- typescript‑eslint: https://typescript-eslint.io
- simple‑import‑sort keeps imports tidy by default

### ✨ Prettier formatting

- Prettier: https://prettier.io
- Opinionated, consistent formatting with `endOfLine: "lf"` for cross‑platform harmony

### 📚 TypeDoc API documentation

- TypeDoc: https://typedoc.org
- Generates browsable API docs from your TSDoc comments

### 🚀 Release automation (release‑it) + optional Lefthook

- release‑it: https://github.com/release-it/release-it
- Lefthook (optional Git hooks manager): https://lefthook.dev
- Version bump, changelog, GitHub release, npm publish — all wired

### 🤖 STAN — AI‑assisted refactoring & patch workflow

- STAN: https://github.com/karmaniverous/stan
- A rigorous, patch‑first assistant that helps refactor safely, keep docs in sync, and maintain clean diffs

### ☁️ GitHub Actions cloud sync backup (Rclone)

- Workflow: this repo ships a backup workflow at `.github/workflows/sync.yml` which calls a shared workflow: https://github.com/karmaniverous/gha-workflows/blob/main/.github/workflows/cloud-sync.yml
- It leverages the Setup Rclone Action: https://github.com/marketplace/actions/setup-rclone-action
- Free and useful: a simple, no‑cost alternative to pricey GitHub backup tools.
- Safe by default: a clone from this template will NOT back up to anyone’s cloud without credentials. The action will FAIL unless the `RCLONE_CONFIG` repo secret is set (providing auth + destination).
- Don’t want it? Just delete `.github/workflows/sync.yml`.
- See the action page for details on configuring `RCLONE_CONFIG`.

### 🧩 Peer dependencies & tree‑shaking

- peerDependencies (npm): https://docs.npmjs.com/files/package.json/- `sideEffects: false` (tree‑shaking hint): https://webpack.js.org/guides/tree-shaking/

---

## How to use this template

Option A — GitHub “Use this template”

1. Open this repository on GitHub.
2. Click “Use this template” → “Create a new repository”.
3. Pick your owner/org and repo name, then create the repo.
4. Clone your new repo locally.

Option B — degit (no git history)

```bash
npx degit karmaniverous/react-component-npm-package-template-ts my-lib
cd my-lib
git init && git add -A && git commit -m "chore: scaffold from template"
```

Option C — shallow clone then reset history

```bash
git clone --depth=1 https://github.com/karmaniverous/react-component-npm-package-template-ts my-lib
cd my-lib
rm -rf .git
git init && git add -A && git commit -m "chore: scaffold from template"
```

Replace placeholders (package.json and docs)

- package.json
  - name: Use your scoped package, e.g. @your-scope/my-lib
  - version: 0.0.0 (start here; release-it will bump on first release)
  - description, author, license
  - repository.url: git+https://github.com/your-org/my-lib.git
  - bugs.url: https://github.com/your-org/my-lib/issues
  - homepage: https://github.com/your-org/my-lib#readme
  - keywords: adjust for your library
  - publishConfig.access: public (keep for public scoped packages)
- README.md
  - Title, import examples (replace @your-scope/react-component-template with your real package name)
- typedoc.json
  - hostedBaseUrl and navigationLinks.GitHub to point to your repo/docs
- FUNDING.yml (optional)
  - Update to your funding info or remove

Quick package.json edits with npm

```bash
npm pkg set name='@your-scope/my-lib' version='0.0.0' \
  description='My awesome React component library' \
  author='Your Name <you@example.com>' license='MIT' \
  repository.type='git' \
  repository.url='git+https://github.com/your-org/my-lib.git' \
  bugs.url='https://github.com/your-org/my-lib/issues' \
  homepage='https://github.com/your-org/my-lib#readme'
```

Prepare for your first release

1. Install and verify

```bash
npm install
npx lefthook install   # optional
npm run lint
npm run test
npm run typecheck
npm run build
```

2. Configure your GitHub token (for release-it)
   - Copy .env.local.template to .env.local.
   - Create a GitHub Personal Access Token (classic) with “repo” scope: https://github.com/settings/tokens
   - Set GITHUB_TOKEN in .env.local.

3. Push to your repo (main branch)

```bash
git remote add origin git@github.com:your-org/my-lib.git
git push -u origin main
```

4. Release (interactive)

```bash
npm run release
```

release-it will bump the version (starting from 0.0.0), run lint/test/knip/build, tag, publish to npm, and create a GitHub Release.

## Getting Started

Prerequisites

- Node.js 20+ (recommended). If you use node >= 20.6, see the lint note under “Linting & formatting” about “--import tsx”.

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

- The test environment is happy‑dom for speed and stability. You can switch to jsdom later if needed.
- Vitest excludes stale compiled tests from .rollup.cache.

- Also verify your library entry (src/index.ts) re-exports what you intend. A tiny test can import from the library entry instead of deep paths:

```tsx
// src/index.test.tsx
import { render, screen } from '@testing-library/react';
import { HelloWorld } from './index';

it('re-exports HelloWorld', () => {
  render(<HelloWorld who="Library" />);
  expect(screen.getByText('Hello Library')).toBeInTheDocument();
});
```

- Coverage scope: docs/, dist/, and playground/ are excluded in vitest.config.ts so coverage focuses on your source. Adjust test.coverage.exclude as needed if you want to include or exclude additional paths.

---

## View in the browser (Vite playground)

A minimal playground is included under playground/ for fast, local viewing with HMR. It imports your components directly from src (no publishing required).

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

- react, react-dom, and react/jsx-runtime are marked external and must be installed by consumers. They are listed as peerDependencies and devDependencies here for DX.

ESM only

- This template ships ESM only (no CJS/IIFE). Most modern toolchains support this directly. If you need CJS, add a second Rollup target.

Release flow (optional)

- release-it is configured to run lint/test/knip/build, generate changelog, and publish to npm + GitHub releases.

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

- If you see “tsx must be loaded with --import instead of --loader”, update the lint scripts to:

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

- Type checks focus on src/\*\* and test setup. Playground and test files are excluded from typecheck to keep the build/docs pipeline friction‑free.

---

## API docs with TypeDoc

Generate docs from your TSDoc comments

```bash
npm run docs
```

Output is written to docs/. You can host this via GitHub Pages or your preferred static host. Additional behavior is configured in typedoc.json.

---

## FAQ and tips

- Why ESM only?
  - Simpler outputs and smaller surface area. Add a CJS target in Rollup if you must support CJS consumers.
- Where do I put styles?
  - This template ships “sideEffects: false” and no CSS by default. Add your own styling approach (CSS modules, CSS‑in‑JS, etc.) per component need.
- How do I add more components?
  - Create new files under src/components, export from src/index.ts, add tests, and render them in the playground during development.
- Can I use Storybook or Ladle?
  - Yes — add it later if you need richer component docs/demos. The Vite playground keeps things minimal to start.

---

## Status & readiness

- Build, docs, and typecheck pass.
- Tests pass with Vitest + Testing Library.
- Lint is configured with a TS flat config; if you’re on Node ≥ 20.6, consider switching lint scripts from “--loader tsx” to “--import tsx” (see above).
- For a typical React 18 component workflow, this template is ready to use.

---

Built for you with ❤️ on Bali! Find more great tools & templates on [my GitHub Profile](https://github.com/karmaniverous).
