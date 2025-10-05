import { within } from '@testing-library/react';
import { bench, describe } from 'vitest';

import {
  addRuleAndGetContent,
  benchCleanup,
  getFieldByLabel,
  renderRRStack,
} from './bench.utils';

describe('HookFormRRStack (bench: rule editing)', () => {
  bench('add rule', async () => {
    renderRRStack();
    await addRuleAndGetContent(document.body);
    benchCleanup();
  });

  bench('edit label', async () => {
    const { container } = renderRRStack();
    const { user } = await addRuleAndGetContent(container);
    const input = within(container).getByPlaceholderText('Rule label');
    await user.clear(input as HTMLInputElement);
    await user.type(input as HTMLInputElement, 'Test Rule');
    benchCleanup();
  });

  bench('toggle Effect (Active ↔ Blackout)', async () => {
    const { container } = renderRRStack();
    const { user, content } = await addRuleAndGetContent(container);

    const effectField = getFieldByLabel(content, 'Effect');
    const effectDropdown = within(effectField).getByTestId('dropdown');
    await user.selectOptions(effectDropdown, 'blackout');
    await user.selectOptions(effectDropdown, 'active');
    benchCleanup();
  });
});
