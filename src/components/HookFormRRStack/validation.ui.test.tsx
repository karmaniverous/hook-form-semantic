import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { FieldValues } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { Form } from 'semantic-ui-react';
import { describe, expect, it } from 'vitest';

import { HookFormRRStack } from './HookFormRRStack';
import { getFieldByLabel, getFieldValueText } from './testUtils/fields';
import type { HookFormRRStackData } from './types';

// Shared harnesses
const TestForm = () => {
  const { control, handleSubmit } = useForm<{ schedule: HookFormRRStackData }>({
    defaultValues: { schedule: { timezone: 'UTC', rules: [] } },
  });
  return (
    <Form
      onSubmit={(e) => {
        void handleSubmit(() => {})(e);
      }}
    >
      <HookFormRRStack
        hookName="schedule"
        hookControl={control}
        label="Schedule Configuration"
      />
      <button type="submit">Submit</button>
    </Form>
  );
};

const renderWithDescribeProps = (describeOpts?: {
  includeBounds?: boolean;
  includeTimeZone?: boolean;
  formatTimeZone?: (tz: string) => string;
}) => {
  interface TF extends FieldValues {
    schedule: HookFormRRStackData;
  }
  const Harness = () => {
    const { control } = useForm<TF>({
      defaultValues: { schedule: { timezone: 'UTC', rules: [] } },
    });
    return (
      <Form>
        <HookFormRRStack<TF>
          hookName="schedule"
          hookControl={control}
          describeIncludeBounds={describeOpts?.includeBounds}
          describeIncludeTimeZone={describeOpts?.includeTimeZone}
          describeFormatTimeZone={describeOpts?.formatTimeZone}
        />
      </Form>
    );
  };
  return render(<Harness />);
};

describe('HookFormRRStack (UI validations)', () => {
  it('renders and adds rules via UI', async () => {
    render(<TestForm />);
    expect(screen.getByText('Schedule Configuration')).toBeInTheDocument();
    const user = userEvent.setup();
    await user.click(screen.getByText('Add Rule'));
    expect(screen.getByPlaceholderText('Rule label')).toBeInTheDocument();
  });

  it('allows saving span rules without validation errors', async () => {
    render(<TestForm />);
    const user = userEvent.setup();
    await user.click(screen.getByText('Add Rule'));
    const labelInput = screen.getByPlaceholderText('Rule label');
    await user.type(labelInput, 'Test Rule');
    await waitFor(() => {
      expect(labelInput).toHaveValue('Test Rule');
    });
  });

  it('updates Starts & Ends when rule dates are set and changed', async () => {
    render(<TestForm />);
    const user = userEvent.setup();
    const startsField = getFieldByLabel(document.body, 'Starts');
    const endsField = getFieldByLabel(document.body, 'Ends');
    expect(getFieldValueText(startsField)).toBe('Indefinite');
    expect(getFieldValueText(endsField)).toBe('Indefinite');

    await user.click(screen.getByText('Add Rule'));
    const inputs = await screen.findAllByTestId('date-picker');
    act(() => {
      fireEvent.change(inputs[0], { target: { value: '2025-01-01' } });
    });
    await waitFor(() => {
      expect(getFieldValueText(startsField)).not.toBe('Indefinite');
    });
    act(() => {
      fireEvent.change(inputs[1], { target: { value: '2025-01-02' } });
    });
    await waitFor(() => {
      expect(getFieldValueText(endsField)).not.toBe('Indefinite');
    });
    const prevStarts = getFieldValueText(startsField);
    act(() => {
      fireEvent.change(inputs[0], { target: { value: '2025-01-03' } });
    });
    await waitFor(() => {
      expect(getFieldValueText(startsField)).not.toBe(prevStarts);
    });
  });

  it('RuleDescription updates when setting Months while monthly (without DoM)', async () => {
    const { getByText, container } = renderWithDescribeProps();
    const user = userEvent.setup();
    await user.click(getByText('Add Rule'));
    const description = container.querySelector(
      '.hook-form-rrstack-rule-description',
    ) as HTMLElement;
    const before = (description.textContent ?? '').trim();

    const contents = await screen.findAllByTestId('accordion-content');
    const content = contents[0];
    const freqField = getFieldByLabel(content, 'Frequency');
    const freqDropdown = within(freqField).getByTestId('dropdown');
    await user.selectOptions(freqDropdown as HTMLSelectElement, 'monthly');

    const monthsField = getFieldByLabel(content, 'Months');
    const monthsDropdown = within(monthsField).getByTestId('dropdown');
    await user.selectOptions(monthsDropdown as HTMLSelectElement, '1'); // Jan

    await waitFor(() => {
      const after = (description.textContent ?? '').trim();
      expect(after).not.toBe(before);
    });
  });

  it('RuleDescription updates when setting Weekday and Position (weekly)', async () => {
    const { getByText, container } = renderWithDescribeProps();
    const user = userEvent.setup();
    await user.click(getByText('Add Rule'));
    const description = container.querySelector(
      '.hook-form-rrstack-rule-description',
    ) as HTMLElement;
    const before = (description.textContent ?? '').trim();

    const contents = await screen.findAllByTestId('accordion-content');
    const content = contents[0];
    const freqField = getFieldByLabel(content, 'Frequency');
    const freqDropdown = within(freqField).getByTestId('dropdown');
    await user.selectOptions(freqDropdown as HTMLSelectElement, 'weekly');

    const wdField = getFieldByLabel(content, 'Weekdays');
    const wdDropdown = within(wdField).getByTestId('dropdown');
    await user.selectOptions(wdDropdown as HTMLSelectElement, '0'); // Monday

    const posField = getFieldByLabel(content, 'Position');
    const posDropdown = within(posField).getByTestId('dropdown');
    await user.selectOptions(posDropdown as HTMLSelectElement, '1'); // 1st

    await waitFor(() => {
      const after = (description.textContent ?? '').trim();
      expect(after).not.toBe(before);
    });
  });

  it('RuleDescription updates when setting Frequency/Hours/Minutes', async () => {
    const { getByText, container } = renderWithDescribeProps();
    const user = userEvent.setup();
    await user.click(getByText('Add Rule'));
    const description = container.querySelector(
      '.hook-form-rrstack-rule-description',
    ) as HTMLElement;
    const before = (description.textContent ?? '').trim();

    const contents = await screen.findAllByTestId('accordion-content');
    const content = contents[0];
    const freqField = getFieldByLabel(content, 'Frequency');
    const freqDropdown = within(freqField).getByTestId('dropdown');
    await user.selectOptions(freqDropdown as HTMLSelectElement, 'daily');

    // Clear via change event (stable in happy-dom), then type via userEvent
    const hoursInput = within(content).getByPlaceholderText('9, 13, 17');
    fireEvent.change(hoursInput, { target: { value: '' } });
    await user.type(hoursInput, '9, 13');

    const minutesInput = within(content).getByPlaceholderText('0, 30');
    fireEvent.change(minutesInput, { target: { value: '' } });
    await user.type(minutesInput, '30');

    await waitFor(() => {
      const after = (description.textContent ?? '').trim();
      expect(after).not.toBe(before);
    });
  });

  it('updates RuleDescription when effect changes', async () => {
    const { container } = render(<TestForm />);
    const user = userEvent.setup();
    await user.click(screen.getByText('Add Rule'));
    const description = container.querySelector(
      '.hook-form-rrstack-rule-description',
    ) as HTMLElement;
    const initial = (description.textContent ?? '').trim();

    const contents = await screen.findAllByTestId('accordion-content');
    const content = contents[0];
    const effectField = getFieldByLabel(content, 'Effect');
    const effectDropdown = effectField.querySelector(
      '[data-testid="dropdown"]',
    ) as HTMLSelectElement;
    await user.selectOptions(effectDropdown, 'blackout');

    await waitFor(() => {
      const next = (description.textContent ?? '').trim();
      expect(next).not.toBe(initial);
    });
  });
});
