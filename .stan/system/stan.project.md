# stan.project.md — Project-specific requirements

When updated: 2025-08-29T00:00:00Z

Repository goal

- Provide a ready-to-use template for building and publishing React 18 component libraries using TypeScript.

Baseline decisions

- React
  - Target React 18.
  - Use the modern “react-jsx” runtime.
- Build outputs
  - ESM-only. No CJS or IIFE bundles.
  - ship types (.d.ts).
- Dependencies
  - react and react-dom are peerDependencies (>=18).
  - Also present as devDependencies for local development and playground.
  - Mark package as "sideEffects": false (no global CSS side-effects).
- Linting
  - TS-only rules; no react-specific eslint plugins for now.
  - Playground IS included in lint/Prettier scope (treat as first-class source). Exclude only generated output: dist/, docs/, coverage/, .rollup.cache/, .stan/, context/, diagrams/out/.
  - Flat config in eslint.config.ts (TypeScript), executed via `node --loader tsx` in npm scripts.
  - Windows: set ESLint languageOptions.parserOptions.tsconfigRootDir to path.resolve() to avoid a known typescript-eslint path bug affecting tsconfigRootDir resolution on Windows.
  - Limit lint to non-generated code; exclude dist/, docs/, coverage/, .rollup.cache/, .stan/, context/, and diagrams/out/.
  - Line endings (cross-platform): enforce LF-only in the repo via .gitattributes, .editorconfig, and Prettier (endOfLine: "lf"). If CRLF noise appears locally, normalize once: • git add --renormalize . • npm run lint:fix Editors with Prettier on save should keep files normalized.
  - Tests linted with Vitest recommended rules (non type-checked).
- Testing
  - Vitest with happy-dom environment (project default).
  - @testing-library/react and @testing-library/jest-dom for component tests.
  - jest-dom is registered via vitest.setup.ts.
- Dev preview
  - Vite playground under /playground for interactive browser viewing.
  - Playground is excluded from npm package (files: ["dist"]) and from typecheck.
- Source layout
  - Components under src/components.
  - Public entry at src/index.ts re-exports components.
- Removed legacy pieces
  - CLI example and related build logic removed.
  - No IIFE browser bundle.
- Docs
  - Keep TypeDoc for API docs; entry remains src/index.ts.

Operational notes

- Rollup marks react and react/jsx-runtime as externals.
- Keep release and docs scripts; they may be adjusted later as needed.
- Consider adding Storybook or Ladle later if richer docs are required.
