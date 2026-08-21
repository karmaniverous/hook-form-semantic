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
            /* showBounds, not includeBounds: the engine renamed the option and
               a describeConfig key it does not recognise is silently dropped,
               so the wrong name reads as "Active continuously". */
            describeShowBounds
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

  it('span (Asia/Singapore): header and description show the dates entered', async () => {
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

    /* The dates entered, not a day earlier. The prior expectations captured a
       screenshot taken while rhf2rrstack still remapped an already-floating
       Date through local2utcDateTime, shifting both clamps by the editor's
       offset. */
    await waitFor(() =>
      expect(getFieldValueText(startsField)).toBe('2025-10-01 00:00'),
    );
    await waitFor(() =>
      expect(getFieldValueText(endsField)).toBe('2025-10-31 00:00'),
    );
    /* Prose, not the bracketed "[from …; until …]" the engine used to emit. */
    await waitFor(() =>
      expect((descEl.textContent ?? '').trim()).toContain(
        'from 2025-10-01 00:00 until 2025-10-31 00:00',
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
        `from ${starts} until ${ends}`,
      );
    });

    /* A real IANA zone: the dropdown is built from Intl.supportedValuesOf,
       which omits the Etc/* and UTC aliases entirely. Singapore is the far
       side of Chicago, so a stale conversion cannot coincide. */
    await setTimezone('Asia/Singapore');
    await waitFor(() => {
      const starts = getFieldValueText(startsField);
      const ends = getFieldValueText(endsField);
      expect((descEl.textContent ?? '').trim()).toContain(
        `from ${starts} until ${ends}`,
      );
    });
  });

  it('recurring (daily 09:00): header shows first occurrence, description shows start clamp', async () => {
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

    /* Re-query: changing Frequency remounts the accordion content, so a node
       captured before the change is detached and typing into it is silently
       lost. */
    const live = () => screen.getAllByTestId('accordion-content')[0];
    fireEvent.change(within(live()).getByPlaceholderText('9, 13, 17'), {
      target: { value: '9' },
    });
    fireEvent.change(within(live()).getByPlaceholderText('0, 30'), {
      target: { value: '0' },
    });

    // Chicago (UTC-6) -> first occurrence: 2025-01-01 09:00 local
    const startsField = getFieldByLabel(document.body, 'Starts');
    await waitFor(() =>
      expect(getFieldValueText(startsField)).toBe('2025-01-01 09:00'),
    );

    /* The header reports the first OCCURRENCE, the description the rule's start
       CLAMP. A recurring rule separates them by the recurrence time; only for a
       span do they coincide. */
    const descEl = document.querySelector(
      '.hook-form-rrstack-rule-description',
    ) as HTMLElement;
    await waitFor(() => {
      const text = (descEl.textContent ?? '').trim();
      expect(text).toContain('at 9:00');
      expect(text).toContain('from 2025-01-01 00:00');
    });

    /* Wall times are invariant under a timezone change. The rule means 9:00
       wherever it is read, so switching zones moves the underlying instants and
       leaves the display alone -- the same floating convention the round-trip
       tests pin. */
    await setTimezone('Asia/Singapore');
    const tzDropdown = within(
      getFieldByLabel(document.body, 'Timezone'),
    ).getAllByTestId('dropdown')[0] as HTMLSelectElement;
    await waitFor(() => expect(tzDropdown.value).toBe('Asia/Singapore'));

    expect(getFieldValueText(startsField)).toBe('2025-01-01 09:00');
    expect((descEl.textContent ?? '').trim()).toContain('at 9:00');
  });
});
