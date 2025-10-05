import { fireEvent, within } from '@testing-library/react';
import { bench, describe } from 'vitest';

import {
  addRuleAndGetContent,
  benchCleanup,
  getFieldByLabel,
  renderRRStack,
} from './bench.utils';

describe('HookFormRRStack (bench: recurrence)', () => {
  bench('set Frequency → daily; set Interval/Count', async () => {
    renderRRStack();
    const { user, content } = await addRuleAndGetContent();

    // Frequency
    const freqField = getFieldByLabel(content, 'Frequency');
    const freqDropdown = within(freqField).getByTestId('dropdown');
    await user.selectOptions(freqDropdown, 'daily');

    // Interval
    const intervalField = getFieldByLabel(content, 'Interval');
    const intervalInput = within(intervalField).getByRole('spinbutton', {
      name: '',
    });
    fireEvent.change(intervalInput, { target: { value: '2' } });

    // Count
    const countField = getFieldByLabel(content, 'Count');
    const countInput = within(countField).getByRole('spinbutton', { name: '' });
    fireEvent.change(countInput, { target: { value: '10' } });

    benchCleanup();
  });

  bench('edit Time constraints (Hours, Minutes)', async () => {
    renderRRStack();
    const { user, content } = await addRuleAndGetContent();

    // Frequency → daily to reveal time fields
    const freqField = getFieldByLabel(content, 'Frequency');
    const freqDropdown = within(freqField).getByTestId('dropdown');
    await user.selectOptions(freqDropdown, 'daily');

    // Hours (unique placeholder in Time column)
    const hoursInput = within(content).getByPlaceholderText('9, 13, 17');
    await user.clear(hoursInput as HTMLInputElement);
    await user.type(hoursInput as HTMLInputElement, '9, 13, 17');

    const minutesInput = within(content).getByPlaceholderText('0, 30');
    await user.clear(minutesInput as HTMLInputElement);
    await user.type(minutesInput as HTMLInputElement, '0, 30');

    benchCleanup();
  });
});
