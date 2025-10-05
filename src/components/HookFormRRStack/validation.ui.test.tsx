import type { RRStackOptions } from '@karmaniverous/rrstack';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import type { FieldValues } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { Form } from 'semantic-ui-react';
import { describe, expect, it } from 'vitest';

import { HookFormRRStack } from './HookFormRRStack';
import { getFieldByLabel, getFieldValueText } from './testUtils/fields';

// Shared harnesses
const TestForm = () => {
  const { control, handleSubmit } = useForm<{ schedule: RRStackOptions }>({
    defaultValues: { schedule: { timezone: 'UTC', rules: [] } },
  });
  return (
    <Form onSubmit={handleSubmit(() => {})}>
      <HookFormRRStack
        hookName="schedule"
        hookControl={control}
        label="Schedule Configuration"
      />
      <button type="submit">Submit</button>
    </Form>
  );
};

const renderWithDescribeProps = (describe?: {
  includeBounds?: boolean;
  includeTimeZone?: boolean;
  formatTimeZone?: (tz: string) => string;
}) => {
  interface TF extends FieldValues {
    schedule: RRStackOptions;
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
          describeIncludeBounds={describe?.includeBounds}
          describeIncludeTimeZone={describe?.includeTimeZone}
          describeFormatTimeZone={describe?.formatTimeZone}
        />
      </Form>
    );
  };
  return render(<Harness />);
};

describe('HookFormRRStack (UI validations)', () => {
  it('renders and adds rules via UI', () => {
    render(<TestForm />);
    expect(screen.getByText('Schedule Configuration')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Add Rule'));
    expect(screen.getByPlaceholderText('Rule label')).toBeInTheDocument();
  });

  it('allows saving span rules without validation errors', async () => {
    render(<TestForm />);
    fireEvent.click(screen.getByText('Add Rule'));
    const labelInput = screen.getByPlaceholderText('Rule label');
    fireEvent.change(labelInput, { target: { value: 'Test Rule' } });
    await waitFor(() => {
      expect(labelInput).toHaveValue('Test Rule');
    });
  });

  it('updates Starts & Ends when rule dates are set and changed', async () => {
    render(<TestForm />);
    const startsField = getFieldByLabel(document.body, 'Starts');
    const endsField = getFieldByLabel(document.body, 'Ends');
    expect(getFieldValueText(startsField)).toBe('Indefinite');
    expect(getFieldValueText(endsField)).toBe('Indefinite');

    fireEvent.click(screen.getByText('Add Rule'));
    const inputs = await screen.findAllByTestId('date-picker');
    fireEvent.change(inputs[0], { target: { value: '2025-01-01' } });
    await waitFor(() => {
      expect(getFieldValueText(startsField)).not.toBe('Indefinite');
    });
    fireEvent.change(inputs[1], { target: { value: '2025-01-02' } });
    await waitFor(() => {
      expect(getFieldValueText(endsField)).not.toBe('Indefinite');
    });
    const prevStarts = getFieldValueText(startsField);
    fireEvent.change(inputs[0], { target: { value: '2025-01-03' } });
    await waitFor(() => {
      expect(getFieldValueText(startsField)).not.toBe(prevStarts);
    });
  });

  it('RuleDescription updates when setting Months while monthly (without DoM)', async () => {
    const { getByText, container } = renderWithDescribeProps();
    fireEvent.click(getByText('Add Rule'));
    const description = container.querySelector(
      '.hook-form-rrstack-rule-description',
    ) as HTMLElement;
    const before = (description.textContent ?? '').trim();

    const contents = await screen.findAllByTestId('accordion-content');
    const content = contents[0] as HTMLElement;
    const freqField = getFieldByLabel(content, 'Frequency');
    const freqDropdown = within(freqField).getByTestId(
      'dropdown',
    ) as HTMLSelectElement;
    fireEvent.change(freqDropdown, { target: { value: 'monthly' } });

    const monthsField = getFieldByLabel(content, 'Months');
    const monthsDropdown = within(monthsField).getByTestId(
      'dropdown',
    ) as HTMLSelectElement;
    fireEvent.change(monthsDropdown, { target: { value: '1' } }); // Jan

    await waitFor(() => {
      const after = (description.textContent ?? '').trim();
      expect(after).not.toBe(before);
    });
  });

  it('RuleDescription updates when setting Weekday and Position (weekly)', async () => {
    const { getByText, container } = renderWithDescribeProps();
    fireEvent.click(getByText('Add Rule'));
    const description = container.querySelector(
      '.hook-form-rrstack-rule-description',
    ) as HTMLElement;
    const before = (description.textContent ?? '').trim();

    const contents = await screen.findAllByTestId('accordion-content');
    const content = contents[0] as HTMLElement;
    const freqField = getFieldByLabel(content, 'Frequency');
    const freqDropdown = within(freqField).getByTestId(
      'dropdown',
    ) as HTMLSelectElement;
    fireEvent.change(freqDropdown, { target: { value: 'weekly' } });

    const wdField = getFieldByLabel(content, 'Weekdays');
    const wdDropdown = within(wdField).getByTestId(
      'dropdown',
    ) as HTMLSelectElement;
    fireEvent.change(wdDropdown, { target: { value: '0' } }); // Monday

    const posField = getFieldByLabel(content, 'Position');
    const posDropdown = within(posField).getByTestId(
      'dropdown',
    ) as HTMLSelectElement;
    fireEvent.change(posDropdown, { target: { value: '1' } }); // 1st

    await waitFor(() => {
      const after = (description.textContent ?? '').trim();
      expect(after).not.toBe(before);
    });
  });

  it('RuleDescription updates when setting Frequency/Hours/Minutes', async () => {
    const { getByText, container } = renderWithDescribeProps();
    fireEvent.click(getByText('Add Rule'));
    const description = container.querySelector(
      '.hook-form-rrstack-rule-description',
    ) as HTMLElement;
    const before = (description.textContent ?? '').trim();

    const contents = await screen.findAllByTestId('accordion-content');
    const content = contents[0] as HTMLElement;
    const freqField = getFieldByLabel(content, 'Frequency');
    const freqDropdown = within(freqField).getByTestId(
      'dropdown',
    ) as HTMLSelectElement;
    fireEvent.change(freqDropdown, { target: { value: 'daily' } });

    const hoursInput = within(content).getByPlaceholderText(
      '9, 13, 17',
    ) as HTMLInputElement;
    fireEvent.change(hoursInput, { target: { value: '9, 13' } });
    const minutesInput = within(content).getByPlaceholderText(
      '0, 30',
    ) as HTMLInputElement;
    fireEvent.change(minutesInput, { target: { value: '30' } });

    await waitFor(() => {
      const after = (description.textContent ?? '').trim();
      expect(after).not.toBe(before);
    });
  });

  it('updates RuleDescription when effect changes', async () => {
    const { container } = render(<TestForm />);
    fireEvent.click(screen.getByText('Add Rule'));
    const description = container.querySelector(
      '.hook-form-rrstack-rule-description',
    ) as HTMLElement;
    const initial = (description.textContent ?? '').trim();

    const contents = await screen.findAllByTestId('accordion-content');
    const content = contents[0] as HTMLElement;
    const effectField = getFieldByLabel(content, 'Effect');
    const effectDropdown = effectField.querySelector(
      '[data-testid="dropdown"]',
    ) as HTMLSelectElement;
    fireEvent.change(effectDropdown, { target: { value: 'blackout' } });

    await waitFor(() => {
      const next = (description.textContent ?? '').trim();
      expect(next).not.toBe(initial);
    });
  });
});
