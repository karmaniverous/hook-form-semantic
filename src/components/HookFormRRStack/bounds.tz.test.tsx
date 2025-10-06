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

describe.skip('HookFormRRStack (timezone formatting: Starts/Ends vs RuleDescription)', () => {
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
    // There can be multiple dropdowns inside the RRStack UI; pick the one in the Timezone field.
    const tzDropdowns = within(tzField).getAllByTestId('dropdown');
    const tzDropdown = tzDropdowns[0] as HTMLSelectElement;
    await user.selectOptions(tzDropdown, tz);
  };

  it('span (Asia/Singapore exact scenario): header and description match screenshot (no endDatesInclusive)', async () => {
    renderHarness();
    const user = userEvent.setup();

    // Add span rule
    await user.click(screen.getByText('Add Rule'));

    // Open content and set date-only Start/End as in screenshot
    const content = (await screen.findAllByTestId('accordion-content'))[0];
    const [startInput, endInput] =
      within(content).getAllByTestId('date-picker');
    fireEvent.change(startInput, { target: { value: '2025-10-01' } });
    fireEvent.change(endInput, { target: { value: '2025-10-31' } });

    // Switch Timezone to Asia/Singapore
    await setTimezone('Asia/Singapore');

    const startsField = getFieldByLabel(document.body, 'Starts');
    const endsField = getFieldByLabel(document.body, 'Ends');
    const descEl = document.querySelector(
      '.hook-form-rrstack-rule-description',
    ) as HTMLElement;

    // Assert exact values shown in your browser screenshot
    await waitFor(() =>
      expect(getFieldValueText(startsField)).toBe('2025-09-30 00:00'),
    );
    await waitFor(() =>
      expect(getFieldValueText(endsField)).toBe('2025-10-30 00:00'),
    );
    await waitFor(() =>
      expect((descEl.textContent ?? '').trim()).toContain(
        '[from 2025-09-30 00:00; until 2025-10-30 00:00]',
      ),
    );
  });

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

    // RuleDescription includes bounds in the same tz with the same formatting
    const descEl = document.querySelector(
      '.hook-form-rrstack-rule-description',
    ) as HTMLElement;
    await waitFor(() => {
      const starts = getFieldValueText(startsField);
      const ends = getFieldValueText(endsField);
      // Sanity: header populated
      expect(starts).not.toBe('Indefinite');
      expect(ends).not.toBe('Indefinite');
      // Description matches header values
      expect((descEl.textContent ?? '').trim()).toContain(
        `[from ${starts}; until ${ends}]`,
      );
    });

    // Switch timezone to UTC; header and description must update accordingly
    await setTimezone('Etc/UTC');
    await waitFor(() => {
      const starts = getFieldValueText(startsField);
      const ends = getFieldValueText(endsField);
      expect((descEl.textContent ?? '').trim()).toContain(
        `[from ${starts}; until ${ends}]`,
      );
    });
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
    await waitFor(() => {
      const starts = getFieldValueText(startsField);
      expect((descEl.textContent ?? '').trim()).toContain(`[from ${starts}]`);
    });

    // Switch timezone to UTC; bound should shift to 15:00
    await setTimezone('Etc/UTC');
    await waitFor(() => {
      const starts = getFieldValueText(startsField);
      expect((descEl.textContent ?? '').trim()).toContain(`[from ${starts}]`);
    });
  });
});
