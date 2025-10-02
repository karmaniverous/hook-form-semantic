import '@testing-library/jest-dom/vitest';
// Register test doubles and widget mocks via side-effect modules.
// These modules call vi.mock(...) to stub third‑party packages for tests.
import './test/setup/mocks/semantic';
import './test/setup/mocks/pickers';
import './test/setup/mocks/inputs';
import './test/setup/mocks/json-wysiwyg';

export {};
