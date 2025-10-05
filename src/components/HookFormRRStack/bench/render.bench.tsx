import { bench, describe } from 'vitest';

import { benchCleanup, renderRRStack } from './bench.utils';

describe('HookFormRRStack (bench: render)', () => {
  bench('render (empty schedule)', () => {
    renderRRStack();
    benchCleanup();
  });
});
