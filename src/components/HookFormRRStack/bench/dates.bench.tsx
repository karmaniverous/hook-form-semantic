import { fireEvent, within } from '@testing-library/react';
import { bench, describe } from 'vitest';

import {
  addRuleAndGetContent,
  benchCleanup,
  renderRRStack,
} from './bench.utils';

describe('HookFormRRStack (bench: dates)', () => {
  bench('set Start & End dates', async () => {
    const { container } = renderRRStack();
    const { content } = await addRuleAndGetContent(container);
    const dateInputs = within(content).getAllByTestId('date-picker');
    fireEvent.change(dateInputs[0], { target: { value: '2025-01-01' } });
    fireEvent.change(dateInputs[1], { target: { value: '2025-01-03' } });
    benchCleanup();
  });

  bench('set only Start date', async () => {
    const { container } = renderRRStack();
    const { content } = await addRuleAndGetContent(container);
    const dateInputs = within(content).getAllByTestId('date-picker');
    fireEvent.change(dateInputs[0], { target: { value: '2025-02-01' } });
    benchCleanup();
  });

  bench('set then clear Start & End dates', async () => {
    const { container } = renderRRStack();
    const { content } = await addRuleAndGetContent(container);
    const dateInputs = within(content).getAllByTestId('date-picker');
    fireEvent.change(dateInputs[0], { target: { value: '2025-03-01' } });
    fireEvent.change(dateInputs[1], { target: { value: '2025-03-05' } });
    fireEvent.change(dateInputs[0], { target: { value: '' } });
    fireEvent.change(dateInputs[1], { target: { value: '' } });
    benchCleanup();
  });
});
