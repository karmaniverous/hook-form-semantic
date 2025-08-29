When updated: 2025-08-29T00:00:00Z

Next up
- Refresh README to reflect React component template workflow (build,
  test, Vite playground usage).
- Optionally add story tooling (Storybook or Ladle) if docs scale up.
- Consider pruning unused devDependencies flagged by knip.

Completed (recent)
- Converted template to React 18 with react-jsx runtime.
- Switched to ESM-only build; removed CJS/IIFE and CLI scaffold.
- Added Vite playground under /playground for browser preview.
- Added HelloWorld component + tests (Testing Library).
- Marked react/react-dom as peerDependencies; set sideEffects: false.
- Updated rollup config to externalize react & react/jsx-runtime.
- Kept TypeDoc; preserved Vitest + happy-dom environment.
- Updated package/repository metadata placeholders.
