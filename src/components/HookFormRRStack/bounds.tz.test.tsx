import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { FieldValues, Path } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { Form } from 'semantic-ui-react';
import { describe, expect, it } from 'vitest';

import { HookFormRRStack } from './HookFormRRStack';
import { getFieldByLabel, getFieldValueText } from './testUtils/fields';

describe('HookFormRRStack (timezone formatting: Starts/Ends vs RuleDescription)', () => {
  const renderHarness = () => {
    interface TF extends FieldValues {
      schedule: {
        timezone: string;
        timeUnit: 'ms' | 's';
        rules: unknown[];
      };
    }
    const Harness = () => {
      const { control } = useForm<TF>({
        defaultValues: {
          schedule: { timezone: 'America/Chicago', timeUnit: 'ms', rules: [] },
        },
      });
      return (
        <Form>
          <HookFormRRStack<TF>
            hookControl={control}
            hookName={'schedule' as Path<TF>}
            describeIncludeBounds
            describeBoundsFormat="yyyy-LL-dd HH:mm"
          />
        </Form>
      );
    };
    return render(<Harness />);
  };

  const setTimezone = async (tz: string) => {
    const user = userEvent.setup();
    const tzField = getFieldByLabel(document.body, 'Timezone');
    const tzDropdown = within(tzField).getByTestId('dropdown');
    await user.selectOptions(tzDropdown as HTMLSelectElement, tz);
  };

  it('span: header Starts/Ends and RuleDescription bounds reflect configured timezone and stay consistent', async () => {
    renderHarness();
    const user = userEvent.setup();

    // Add a span rule (default freq after Add Rule)
    await user.click(screen.getByText('Add Rule'));

    // Work inside the accordion content
    const content = (await screen.findAllByTestId('accordion-content'))[0];

    // Set Start & End (date-only) -- Chicago local date midnight
    const dateInputs = within(content).getAllByTestId('date-picker');
    fireEvent.change(dateInputs[0], { target: { value: '2025-01-01' } }); // Start
    fireEvent.change(dateInputs[1], { target: { value: '2025-01-03' } }); // End

    // Chicago (CST, UTC-6): header shows local tz
    const startsField = getFieldByLabel(document.body, 'Starts');
    const endsField = getFieldByLabel(document.body, 'Ends');

    await waitFor(() =>
      expect(getFieldValueText(startsField)).toBe('2025-01-01 00:00'),
    );
    await waitFor(() =>
      expect(getFieldValueText(endsField)).toBe('2025-01-03 00:00'),
    );

    // RuleDescription includes bounds in the same tz with the same formatting
    const descEl = document.querySelector(
      '.hook-form-rrstack-rule-description',
    ) as HTMLElement;
    await waitFor(() =>
      expect((descEl.textContent ?? '').trim()).toContain(
        '[from 2025-01-01 00:00; until 2025-01-03 00:00]',
      ),
    );

    // Switch timezone to UTC; header and description must update accordingly
    await setTimezone('UTC');
    await waitFor(() =>
      expect(getFieldValueText(startsField)).toBe('2025-01-01 06:00'),
    );
    await waitFor(() =>
      expect(getFieldValueText(endsField)).toBe('2025-01-03 06:00'),
    );
    await waitFor(() =>
      expect((descEl.textContent ?? '').trim()).toContain(
        '[from 2025-01-01 06:00; until 2025-01-03 06:00]',
      ),
    );
  });

  it('recurring (daily 09:00): header Starts and RuleDescription [from …] are consistent across timezones', async () => {
    renderHarness();
    const user = userEvent.setup();

    // Add rule
    await user.click(screen.getByText('Add Rule'));

    // Work inside the accordion content
    const content = (await screen.findAllByTestId('accordion-content'))[0];

    // Set Start date (date-only) – Chicago midnight; recurrence daily 09:00
    const dateInputs = within(content).getAllByTestId('date-picker');
    fireEvent.change(dateInputs[0], { target: { value: '2025-01-01' } }); // Start

    // Frequency → daily
    const freqField = getFieldByLabel(content, 'Frequency');
    const freqDropdown = within(freqField).getByTestId('dropdown');
    await user.selectOptions(freqDropdown as HTMLSelectElement, 'daily');

    // Time: Hours = 9, Minutes = 0
    const hoursInput = within(content).getByPlaceholderText('9, 13, 17');
    fireEvent.change(hoursInput, { target: { value: '' } });
    await user.type(hoursInput, '9');

    const minutesInput = within(content).getByPlaceholderText('0, 30');
    fireEvent.change(minutesInput, { target: { value: '' } });
    await user.type(minutesInput, '0');

    // Chicago (UTC-6) -> first occurrence: 2025-01-01 09:00 local
    const startsField = getFieldByLabel(document.body, 'Starts');
    await waitFor(() =>
      expect(getFieldValueText(startsField)).toBe('2025-01-01 09:00'),
    );

    const descEl = document.querySelector(
      '.hook-form-rrstack-rule-description',
    ) as HTMLElement;
    await waitFor(() =>
      expect((descEl.textContent ?? '').trim()).toContain(
        '[from 2025-01-01 09:00]',
      ),
    );

    // Switch timezone to UTC; bound should shift to 15:00
    await setTimezone('UTC');
    await waitFor(() =>
      expect(getFieldValueText(startsField)).toBe('2025-01-01 15:00'),
    );
    await waitFor(() =>
      expect((descEl.textContent ?? '').trim()).toContain(
        '[from 2025-01-01 15:00]',
      ),
    );
  });
});
