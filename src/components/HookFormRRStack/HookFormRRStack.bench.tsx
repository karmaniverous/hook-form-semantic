import { cleanup, fireEvent, render, within } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { Form } from 'semantic-ui-react';
import { bench, describe } from 'vitest';

import { HookFormRRStack } from './HookFormRRStack';
import type { HookFormRRStackData } from './types';

type FormData = {
  schedule: HookFormRRStackData;
};

function Harness() {
  const { control } = useForm<FormData>({
    defaultValues: {
      schedule: {
        timezone: 'UTC',
        rules: [],
      },
    },
  });

  return (
    <Form>
      <HookFormRRStack<FormData>
        hookControl={control}
        hookName="schedule"
        // Keep UI responsive in benchmarks
        rrstackRenderDebounce={0}
      />
    </Form>
  );
}

const renderRRStack = () => render(<Harness />);

const getFieldByLabel = (root: HTMLElement, labelText: string) => {
  const fields = Array.from(
    root.querySelectorAll<HTMLElement>('[data-testid="form-field"]'),
  );
  for (const f of fields) {
    const first = f.firstElementChild as HTMLElement | null;
    const txt = (first?.textContent ?? '').trim();
    if (txt.includes(labelText)) return f;
  }
  throw new Error(`Field not found: ${labelText}`);
};

describe('HookFormRRStack (benchmarks: React component interactions)', () => {
  bench('render (empty schedule)', () => {
    renderRRStack();
    cleanup();
  });

  bench('add rule', () => {
    const { getByText } = renderRRStack();
    fireEvent.click(getByText('Add Rule'));
    cleanup();
  });

  bench('edit label', () => {
    const { container, getByText } = renderRRStack();
    fireEvent.click(getByText('Add Rule'));
    const input = within(container).getByPlaceholderText(
      'Rule label',
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Test Rule' } });
    cleanup();
  });

  bench('toggle Effect (Active ↔ Blackout)', () => {
    const { container, getByText } = renderRRStack();
    fireEvent.click(getByText('Add Rule'));
    const content = container.querySelector(
      '[data-testid="accordion-content"]',
    ) as HTMLElement;
    const effectField = getFieldByLabel(content, 'Effect');
    const effectDropdown = within(effectField).getByTestId(
      'dropdown',
    ) as HTMLSelectElement;
    fireEvent.change(effectDropdown, { target: { value: 'blackout' } });
    fireEvent.change(effectDropdown, { target: { value: 'active' } });
    cleanup();
  });

  bench('set Frequency → daily; set Interval/Count', () => {
    const { container, getByText } = renderRRStack();
    fireEvent.click(getByText('Add Rule'));
    const content = container.querySelector(
      '[data-testid="accordion-content"]',
    ) as HTMLElement;

    // Frequency
    const freqField = getFieldByLabel(content, 'Frequency');
    const freqDropdown = within(freqField).getByTestId(
      'dropdown',
    ) as HTMLSelectElement;
    fireEvent.change(freqDropdown, { target: { value: 'daily' } });

    // Interval
    const intervalField = getFieldByLabel(content, 'Interval');
    const intervalInput = within(intervalField).getByRole('spinbutton', {
      name: '',
    }) as HTMLInputElement;
    fireEvent.change(intervalInput, { target: { value: '2' } });

    // Count
    const countField = getFieldByLabel(content, 'Count');
    const countInput = within(countField).getByRole('spinbutton', {
      name: '',
    }) as HTMLInputElement;
    fireEvent.change(countInput, { target: { value: '10' } });

    cleanup();
  });

  bench('edit Time constraints (Hours, Minutes)', () => {
    const { container, getByText } = renderRRStack();
    fireEvent.click(getByText('Add Rule'));
    const content = container.querySelector(
      '[data-testid="accordion-content"]',
    ) as HTMLElement;

    // Frequency → daily to reveal time fields
    const freqField = getFieldByLabel(content, 'Frequency');
    const freqDropdown = within(freqField).getByTestId(
      'dropdown',
    ) as HTMLSelectElement;
    fireEvent.change(freqDropdown, { target: { value: 'daily' } });

    // Hours: use unique placeholder in Time column to avoid picking Duration field
    const hoursInput = within(content).getByPlaceholderText(
      '9, 13, 17',
    ) as HTMLInputElement;
    fireEvent.change(hoursInput, { target: { value: '9, 13, 17' } });

    const minutesInput = within(content).getByPlaceholderText(
      '0, 30',
    ) as HTMLInputElement;
    fireEvent.change(minutesInput, { target: { value: '0, 30' } });

    cleanup();
  });

  bench('edit Duration fields (Years..Sec)', () => {
    const { container, getByText } = renderRRStack();
    fireEvent.click(getByText('Add Rule'));
    const content = container.querySelector(
      '[data-testid="accordion-content"]',
    ) as HTMLElement;

    // Frequency → daily to reveal duration section (also shown for span, but keep consistent)
    const freqField = getFieldByLabel(content, 'Frequency');
    const freqDropdown = within(freqField).getByTestId(
      'dropdown',
    ) as HTMLSelectElement;
    fireEvent.change(freqDropdown, { target: { value: 'daily' } });

    for (const [label, value] of [
      ['Years', '1'],
      ['Months', '2'],
      ['Days', '3'],
      ['Hours', '4'],
      ['Min', '15'],
      ['Sec', '30'],
    ] as const) {
      const fld = getFieldByLabel(content, label);
      const inp = fld.querySelector('input') as HTMLInputElement;
      fireEvent.change(inp, { target: { value } });
    }

    cleanup();
  });

  bench('set Days of Month (DoM) while Monthly', () => {
    const { container, getByText } = renderRRStack();
    fireEvent.click(getByText('Add Rule'));
    const content = container.querySelector(
      '[data-testid="accordion-content"]',
    ) as HTMLElement;

    // Switch to Monthly to reveal the Months/DoM/Weekdays/Position section
    const freqField = getFieldByLabel(content, 'Frequency');
    const freqDropdown = within(freqField).getByTestId(
      'dropdown',
    ) as HTMLSelectElement;
    fireEvent.change(freqDropdown, { target: { value: 'monthly' } });

    // Enter Days of Month (local text input; safe in current mocks)
    const domInput = within(content).getByPlaceholderText(
      '25 (for 25th)',
    ) as HTMLInputElement;
    fireEvent.change(domInput, { target: { value: '1, 15, 31' } });

    cleanup();
  });

  bench('cycle Frequency (weekly → monthly → daily)', () => {
    const { container, getByText } = renderRRStack();
    fireEvent.click(getByText('Add Rule'));
    const content = container.querySelector(
      '[data-testid="accordion-content"]',
    ) as HTMLElement;

    const freqField = getFieldByLabel(content, 'Frequency');
    const freqDropdown = within(freqField).getByTestId(
      'dropdown',
    ) as HTMLSelectElement;
    fireEvent.change(freqDropdown, { target: { value: 'weekly' } });
    fireEvent.change(freqDropdown, { target: { value: 'monthly' } });
    fireEvent.change(freqDropdown, { target: { value: 'daily' } });

    cleanup();
  });

  bench('set Frequency → span (Span rule)', () => {
    const { container, getByText } = renderRRStack();
    fireEvent.click(getByText('Add Rule'));
    const content = container.querySelector(
      '[data-testid="accordion-content"]',
    ) as HTMLElement;

    const freqField = getFieldByLabel(content, 'Frequency');
    const freqDropdown = within(freqField).getByTestId(
      'dropdown',
    ) as HTMLSelectElement;
    fireEvent.change(freqDropdown, { target: { value: 'span' } });

    cleanup();
  });

  bench('clear Interval & Count after setting', () => {
    const { container, getByText } = renderRRStack();
    fireEvent.click(getByText('Add Rule'));
    const content = container.querySelector(
      '[data-testid="accordion-content"]',
    ) as HTMLElement;

    // Ensure recurrence fields visible
    const freqField = getFieldByLabel(content, 'Frequency');
    const freqDropdown = within(freqField).getByTestId(
      'dropdown',
    ) as HTMLSelectElement;
    fireEvent.change(freqDropdown, { target: { value: 'daily' } });

    const intervalField = getFieldByLabel(content, 'Interval');
    const intervalInput = within(intervalField).getByRole('spinbutton', {
      name: '',
    }) as HTMLInputElement;
    fireEvent.change(intervalInput, { target: { value: '3' } });
    fireEvent.change(intervalInput, { target: { value: '' } });

    const countField = getFieldByLabel(content, 'Count');
    const countInput = within(countField).getByRole('spinbutton', {
      name: '',
    }) as HTMLInputElement;
    fireEvent.change(countInput, { target: { value: '7' } });
    fireEvent.change(countInput, { target: { value: '' } });

    cleanup();
  });

  bench('set Start & End dates', () => {
    const { container, getByText } = renderRRStack();
    fireEvent.click(getByText('Add Rule'));
    const content = container.querySelector(
      '[data-testid="accordion-content"]',
    ) as HTMLElement;

    const dateInputs = Array.from(
      content.querySelectorAll<HTMLInputElement>('[data-testid="date-picker"]'),
    );
    if (dateInputs.length >= 2) {
      fireEvent.change(dateInputs[0], { target: { value: '2025-01-01' } });
      fireEvent.change(dateInputs[1], { target: { value: '2025-01-03' } });
    }

    cleanup();
  });

  bench('set only Start date', () => {
    const { container, getByText } = renderRRStack();
    fireEvent.click(getByText('Add Rule'));
    const content = container.querySelector(
      '[data-testid="accordion-content"]',
    ) as HTMLElement;

    const dateInputs = Array.from(
      content.querySelectorAll<HTMLInputElement>('[data-testid="date-picker"]'),
    );
    if (dateInputs.length >= 1) {
      fireEvent.change(dateInputs[0], { target: { value: '2025-02-01' } });
    }
    cleanup();
  });

  bench('set then clear Start & End dates', () => {
    const { container, getByText } = renderRRStack();
    fireEvent.click(getByText('Add Rule'));
    const content = container.querySelector(
      '[data-testid="accordion-content"]',
    ) as HTMLElement;

    const dateInputs = Array.from(
      content.querySelectorAll<HTMLInputElement>('[data-testid="date-picker"]'),
    );
    if (dateInputs.length >= 2) {
      fireEvent.change(dateInputs[0], { target: { value: '2025-03-01' } });
      fireEvent.change(dateInputs[1], { target: { value: '2025-03-05' } });
      // Clear both
      fireEvent.change(dateInputs[0], { target: { value: '' } });
      fireEvent.change(dateInputs[1], { target: { value: '' } });
    }
    cleanup();
  });

  bench('clear Hours & Minutes after setting', () => {
    const { container, getByText } = renderRRStack();
    fireEvent.click(getByText('Add Rule'));
    const content = container.querySelector(
      '[data-testid="accordion-content"]',
    ) as HTMLElement;

    const freqField = getFieldByLabel(content, 'Frequency');
    const freqDropdown = within(freqField).getByTestId(
      'dropdown',
    ) as HTMLSelectElement;
    fireEvent.change(freqDropdown, { target: { value: 'daily' } });

    const hoursInput = within(content).getByPlaceholderText(
      '9, 13, 17',
    ) as HTMLInputElement;
    fireEvent.change(hoursInput, { target: { value: '8, 12, 16' } });
    fireEvent.change(hoursInput, { target: { value: '' } });

    const minutesInput = within(content).getByPlaceholderText(
      '0, 30',
    ) as HTMLInputElement;
    fireEvent.change(minutesInput, { target: { value: '15, 45' } });
    fireEvent.change(minutesInput, { target: { value: '' } });

    cleanup();
  });

  bench('change Timezone', () => {
    const { container } = renderRRStack();
    const tzField = getFieldByLabel(container, 'Timezone');
    const tzDropdown = within(tzField).getByTestId(
      'dropdown',
    ) as HTMLSelectElement;
    fireEvent.change(tzDropdown, { target: { value: 'America/New_York' } });
    cleanup();
  });

  bench('move rules (top/up/down/bottom) and delete', () => {
    const { container, getByText } = renderRRStack();
    // Create three rules
    fireEvent.click(getByText('Add Rule'));
    fireEvent.click(getByText('Add Rule'));
    fireEvent.click(getByText('Add Rule'));

    // Target the second rule's title row (index 1)
    const titles = Array.from(
      container.querySelectorAll<HTMLElement>(
        '[data-testid="accordion-title"]',
      ),
    );
    const target = titles[1]!;

    const btnTop = within(target).getByTitle('Move to top');
    const btnUp = within(target).getByTitle('Move up');
    const btnDown = within(target).getByTitle('Move down');
    const btnBottom = within(target).getByTitle('Move to bottom');
    const btnDelete = within(target).getByTitle('Delete rule');

    fireEvent.click(btnTop);
    fireEvent.click(btnDown);
    fireEvent.click(btnBottom);
    fireEvent.click(btnUp);
    fireEvent.click(btnDelete);
    cleanup();
  });
});
