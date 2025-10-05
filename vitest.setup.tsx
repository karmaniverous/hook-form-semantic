import '@testing-library/jest-dom/vitest';
// Register test doubles and widget mocks via side-effect modules.
// These modules call vi.mock(...) to stub third‑party packages for tests.
import './test/setup/mocks/semantic';
import './test/setup/mocks/pickers';
import './test/setup/mocks/inputs';
import './test/setup/mocks/json-wysiwyg';

export {};

// Reduce test noise: filter React act() warnings that slip through
// third‑party hooks or internal async scheduling. We still migrate tests to
// userEvent/act, but keep CI logs clean in the interim.
const __origError = console.error;
console.error = (...args: unknown[]) => {
  const [first] = args;
  if (typeof first === 'string' && first.includes('not wrapped in act('))
    return;

  __origError(...(args as [unknown, ...unknown[]]));
};
