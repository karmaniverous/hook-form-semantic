import { describe, expect, test } from 'vitest';

import { HookFormRRStack } from './HookFormRRStack';

describe('HookFormRRStack', () => {
  test('exports HookFormRRStack component', () => {
    expect(HookFormRRStack).toBeDefined();
    expect(typeof HookFormRRStack).toBe('function');
  });
});
