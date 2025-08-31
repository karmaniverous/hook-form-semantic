When updated: 2025-08-31T00:00:00Z

Next up

- Run: npm install to ensure new devDependencies (react, react-dom,
  @types/react, @types/react-dom, vite, @vitejs/plugin-react,
  @testing-library/\*, tsx) are installed before running test/docs/typecheck.
- Optionally add story tooling (Storybook or Ladle) if docs scale up.
- Consider pruning unused devDependencies flagged by knip.

Completed (recent)

- Added tests for library entry re-exports and HelloWorld edge cases.
- Tuned Vitest coverage to exclude docs/, dist/, and playground/ by default.
- Updated README test section with entry re-export example and coverage notes.
- Updated README to reflect React component template usage and features.
- Replaced eslint.config.js with eslint.config.ts (flat config), updated
  npm scripts to run ESLint via node --loader tsx.
- Scoped linting to avoid type-aware parse errors; ignore playground;
  tests use Vitest recommended rules (non type-checked).
- Excluded tests and playground from ts typecheck; removed jest-dom types from tsconfig to prevent build/docs errors if not installed.
- Excluded .rollup.cache from Vitest to avoid stale compiled tests.
- Excluded playground from lint/typecheck to reduce false positives.
- Added vitest.setup.ts and configured jest-dom globally.
- Fixed unsafe return by typing HelloWorld return to JSX.Element.
- Sorted imports and simplified tests.
- Updated stan.config.yml to use standard build script.
- Converted template to React 18 with react-jsx runtime.
- Switched to ESM-only build; removed CJS/IIFE and CLI scaffold.
- Added Vite playground under /playground for browser preview.
- Added HelloWorld component + tests (Testing Library).
- Marked react/react-dom as peerDependencies; set sideEffects: false.
- Updated rollup config to externalize react & react/jsx-runtime.
- Kept TypeDoc; preserved Vitest + happy-dom environment.
- Updated package/repository metadata placeholders.
