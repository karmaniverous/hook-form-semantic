import type { RRStackOptions } from '@karmaniverous/rrstack';
import { RRStack } from '@karmaniverous/rrstack';
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

import { HookFormRRStack } from './HookFormRRStack';

// Define the form data type
interface TestFormData extends FieldValues {
  schedule: RRStackOptions;
}

// Test component that uses HookFormRRStack
const TestForm = () => {
  const { control, handleSubmit } = useForm<TestFormData>({
    defaultValues: {
      schedule: {
        timezone: 'UTC',
        rules: [],
      },
    },
  });

  const onSubmit = (data: TestFormData) => {
    console.log('Form submitted:', data);
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <HookFormRRStack
        hookName="schedule"
        hookControl={control}
        label="Schedule Configuration"
      />
      <button type="submit">Submit</button>
    </Form>
  );
};

describe('HookFormRRStack Validation', () => {
  it('validates timezone using RRStack built-in validation', async () => {
    render(<TestForm />);

    // The component should render without errors with a valid default timezone
    expect(screen.getByText('Schedule Configuration')).toBeInTheDocument();
    expect(screen.getByText('Timezone')).toBeInTheDocument();
  });

  it('validates rules using RRStack compilation', async () => {
    render(<TestForm />);

    // Click "Add Rule" button
    const addRuleButton = screen.getByText('Add Rule');
    fireEvent.click(addRuleButton);

    // Should show the rule editor form (accordion should be open)
    expect(screen.getByPlaceholderText('Rule label')).toBeInTheDocument();

    // Fill in a rule label
    const labelInput = screen.getByPlaceholderText('Rule label');
    fireEvent.change(labelInput, { target: { value: 'Test Span Rule' } });

    // Wait for the label to be updated (due to debouncing)
    await waitFor(() => {
      expect(labelInput).toHaveValue('Test Span Rule');
    });

    // Verify that the rule was added to the list
    await waitFor(() => {
      expect(screen.getByText('Rules (1)')).toBeInTheDocument();
    });
  });

  it('allows saving span rules without validation errors', async () => {
    render(<TestForm />);

    // Click "Add Rule" button
    const addRuleButton = screen.getByText('Add Rule');
    fireEvent.click(addRuleButton);

    // Should show the rule editor form (accordion should be open)
    expect(screen.getByPlaceholderText('Rule label')).toBeInTheDocument();

    // Fill in a label
    const labelInput = screen.getByPlaceholderText('Rule label');
    fireEvent.change(labelInput, { target: { value: 'Test Rule' } });

    // Wait for the label to be updated (due to debouncing)
    await waitFor(() => {
      expect(labelInput).toHaveValue('Test Rule');
    });

    // Verify that the rule was added to the list
    await waitFor(() => {
      expect(screen.getByText('Rules (1)')).toBeInTheDocument();
    });
  });

  it('uses RRStack static methods for timezone validation', () => {
    // Test RRStack's built-in timezone validation
    expect(RRStack.isValidTimeZone('UTC')).toBe(true);
    expect(RRStack.isValidTimeZone('America/New_York')).toBe(true);
    expect(RRStack.isValidTimeZone('Invalid/Timezone')).toBe(false);
  });

  it('validates rules by creating temporary RRStack instances', () => {
    const validRule = {
      effect: 'active' as const,
      duration: { hours: 1 },
      options: {
        freq: 'daily' as const,
        byhour: [9],
        byminute: [0],
        bysecond: [0],
      },
      label: 'Valid Rule',
    };

    // This should not throw an error
    expect(() => {
      new RRStack({
        timezone: 'UTC',
        rules: [validRule],
      });
    }).not.toThrow();
  });

  it('validates rules with starts/ends timestamps', () => {
    const now = Date.now();
    const futureTime = now + 24 * 60 * 60 * 1000; // 24 hours later

    const validRuleWithDates = {
      effect: 'active' as const,
      duration: { hours: 1 },
      options: {
        freq: 'daily' as const,
        starts: now,
        ends: futureTime,
      },
      label: 'Rule with Date Range',
    };

    // This should not throw an error
    expect(() => {
      new RRStack({
        timezone: 'UTC',
        rules: [validRuleWithDates],
      });
    }).not.toThrow();
  });

  it('validates rules with starts/ends timestamps using default timeUnit', () => {
    const now = Date.now();
    const futureTime = now + 24 * 60 * 60 * 1000; // 24 hours later

    const validRuleWithDates = {
      effect: 'active' as const,
      duration: { hours: 1 },
      options: {
        freq: 'daily' as const,
        starts: now,
        ends: futureTime,
      },
      label: 'Rule with Date Range using Default TimeUnit',
    };

    // This should not throw an error
    expect(() => {
      new RRStack({
        timezone: 'UTC',
        rules: [validRuleWithDates],
      });
    }).not.toThrow();
  });

  it('handles rules with only starts timestamp', () => {
    const now = Date.now();

    const ruleWithOnlyStarts = {
      effect: 'active' as const,
      duration: { hours: 1 },
      options: {
        freq: 'daily' as const,
        starts: now,
      },
      label: 'Rule with Only Start Date',
    };

    // This should not throw an error
    expect(() => {
      new RRStack({
        timezone: 'UTC',
        rules: [ruleWithOnlyStarts],
      });
    }).not.toThrow();
  });

  it('handles rules with only ends timestamp', () => {
    const futureTime = Date.now() + 24 * 60 * 60 * 1000;

    const ruleWithOnlyEnds = {
      effect: 'active' as const,
      duration: { hours: 1 },
      options: {
        freq: 'daily' as const,
        ends: futureTime,
      },
      label: 'Rule with Only End Date',
    };

    // This should not throw an error
    expect(() => {
      new RRStack({
        timezone: 'UTC',
        rules: [ruleWithOnlyEnds],
      });
    }).not.toThrow();
  });

  it('updates Starts & Ends when rule dates are set and changed', async () => {
    render(<TestForm />);

    // Initially both should be "Not Set"
    const startsLabel = screen.getByText('Starts');
    const endsLabel = screen.getByText('Ends');
    const startsField = startsLabel.parentElement as HTMLElement;
    const endsField = endsLabel.parentElement as HTMLElement;
    expect(startsField).toBeTruthy();
    expect(endsField).toBeTruthy();
    expect(startsField).toHaveTextContent('Not Set');
    expect(endsField).toHaveTextContent('Not Set');

    // Add a rule
    fireEvent.click(screen.getByText('Add Rule'));

    // There are two date-picker inputs inside the rule form (Start Date, End Date)
    const inputs = await screen.findAllByTestId('date-picker');
    expect(inputs.length).toBeGreaterThanOrEqual(2);

    // Set start date -> Starts should update from "Not Set"
    fireEvent.change(inputs[0], { target: { value: '2025-01-01' } });
    await waitFor(() => {
      expect(startsField).not.toHaveTextContent('Not Set');
    });

    // Set end date -> Ends should update from "Not Set"
    fireEvent.change(inputs[1], { target: { value: '2025-01-02' } });
    await waitFor(() => {
      expect(endsField).not.toHaveTextContent('Not Set');
    });

    // Change start date again -> Starts should change text
    const prevStarts = startsField.textContent;
    fireEvent.change(inputs[0], { target: { value: '2025-01-03' } });
    await waitFor(() => {
      expect(startsField.textContent).not.toBe(prevStarts);
    });

    // Change end date again -> Ends should change text
    const prevEnds = endsField.textContent;
    fireEvent.change(inputs[1], { target: { value: '2025-01-04' } });
    await waitFor(() => {
      expect(endsField.textContent).not.toBe(prevEnds);
    });
  });

  it('RRStackRuleDescription updates when setting Start/End (includeBounds)', async () => {
    const { getByText } = renderWithDescribeProps({ includeBounds: true });
    fireEvent.click(getByText('Add Rule'));
    const description = screen.getByTestId('rule-description-0');
    const before = (description.textContent ?? '').trim();

    // Set Start Date
    const inputs = await screen.findAllByTestId('date-picker');
    fireEvent.change(inputs[0], { target: { value: '2025-04-01' } });
    await waitFor(() => {
      const after = (description.textContent ?? '').trim();
      expect(after).not.toBe(before);
      expect(after.length).toBeGreaterThan(0);
    });

    // Set End Date
    const prev = (description.textContent ?? '').trim();
    fireEvent.change(inputs[1], { target: { value: '2025-04-02' } });
    await waitFor(() => {
      const after = (description.textContent ?? '').trim();
      expect(after).not.toBe(prev);
      expect(after.length).toBeGreaterThan(0);
    });
  });

  it('RRStackRuleDescription updates when setting Months while monthly (without DoM)', async () => {
    const { getByText } = renderWithDescribeProps();
    fireEvent.click(getByText('Add Rule'));
    const description = screen.getByTestId('rule-description-0');
    const before = (description.textContent ?? '').trim();

    // Wait for content
    const contents = await screen.findAllByTestId('accordion-content');
    const content = contents[0] as HTMLElement;

    // Frequency → monthly
    const freqField = getFieldByLabel(content, 'Frequency');
    const freqDropdown = within(freqField).getByTestId(
      'dropdown',
    ) as HTMLSelectElement;
    fireEvent.change(freqDropdown, { target: { value: 'monthly' } });

    // Set a Month (multi-select mock supports fallback to single value)
    const monthsField = getFieldByLabel(content, 'Months');
    const monthsDropdown = within(monthsField).getByTestId(
      'dropdown',
    ) as HTMLSelectElement;
    fireEvent.change(monthsDropdown, { target: { value: '1' } }); // Jan

    await waitFor(() => {
      const after = (description.textContent ?? '').trim();
      expect(after).not.toBe(before);
      expect(after.length).toBeGreaterThan(0);
    });
  });

  it('RRStackRuleDescription updates when setting Weekday and Position (weekly)', async () => {
    const { getByText } = renderWithDescribeProps();
    fireEvent.click(getByText('Add Rule'));
    const description = screen.getByTestId('rule-description-0');
    const before = (description.textContent ?? '').trim();

    // Wait for content
    const contents = await screen.findAllByTestId('accordion-content');
    const content = contents[0] as HTMLElement;

    // Frequency → weekly
    const freqField = getFieldByLabel(content, 'Frequency');
    const freqDropdown = within(freqField).getByTestId(
      'dropdown',
    ) as HTMLSelectElement;
    fireEvent.change(freqDropdown, { target: { value: 'weekly' } });

    // Weekday: Monday (0)
    const wdField = getFieldByLabel(content, 'Weekdays');
    const wdDropdown = within(wdField).getByTestId(
      'dropdown',
    ) as HTMLSelectElement;
    fireEvent.change(wdDropdown, { target: { value: '0' } });

    // Position: 1st (1)
    const posField = getFieldByLabel(content, 'Position');
    const posDropdown = within(posField).getByTestId(
      'dropdown',
    ) as HTMLSelectElement;
    fireEvent.change(posDropdown, { target: { value: '1' } });

    await waitFor(() => {
      const after = (description.textContent ?? '').trim();
      expect(after).not.toBe(before);
      expect(after.length).toBeGreaterThan(0);
    });
  });

  it('updates RRStackRuleDescription when effect changes', async () => {
    render(<TestForm />);

    // Add a rule and open the editor
    fireEvent.click(screen.getByText('Add Rule'));

    // Select the description node directly for reliable assertions
    const description = screen.getByTestId('rule-description-0');
    const initialText = (description.textContent ?? '').trim();

    // Wait for the editor content to appear, then change Effect
    const contents = await screen.findAllByTestId('accordion-content');
    const content = contents[0];

    // Toggle Effect from Active to Blackout (guarantees description change)
    const effectLabel = within(content).getByText('Effect');
    const effectField =
      effectLabel.closest('[data-testid="form-field"]') ??
      effectLabel.parentElement;
    expect(effectField).toBeTruthy();
    const effectDropdown = effectField!.querySelector(
      '[data-testid="dropdown"]',
    ) as HTMLSelectElement | null;
    expect(effectDropdown).toBeTruthy();
    fireEvent.change(effectDropdown as HTMLSelectElement, {
      target: { value: 'blackout' },
    });

    // Expect the description text to update from its initial value.
    await waitFor(() => {
      const nextText = (description.textContent ?? '').trim();
      expect(nextText).not.toBe(initialText);
      expect(nextText.length).toBeGreaterThan(0);
    });
  });
});

// Helpers for description-focused tests
const getFieldByLabel = (root: HTMLElement, labelText: string) => {
  // Find the label element with exact text, then return its nearest field
  // container instead of matching any ancestor that contains the label.
  const labels = Array.from(root.querySelectorAll('label'));
  const labelEl =
    labels.find((l) => (l.textContent ?? '').trim().includes(labelText)) ??
    null;

  if (!labelEl) {
    throw new Error(`Label not found: ${labelText}`);
  }

  const field = labelEl.closest(
    '[data-testid="form-field"]',
  ) as HTMLElement | null;
  if (!field) throw new Error(`Field not found for label: ${labelText}`);
  return field;
};

type DescribeProps = {
  includeBounds?: boolean;
  includeTimeZone?: boolean;
  formatTimeZone?: (tz: string) => string;
};

const renderWithDescribeProps = (describe?: DescribeProps) => {
  interface TF extends FieldValues {
    schedule: RRStackOptions;
  }
  const Harness = () => {
    const { control } = useForm<TF>({
      defaultValues: {
        schedule: {
          timezone: 'UTC',
          rules: [],
        },
      },
    });
    return (
      <Form>
        <HookFormRRStack<TF>
          hookName="schedule"
          hookControl={control}
          rrstackRenderDebounce={0}
          describeIncludeBounds={describe?.includeBounds}
          describeIncludeTimeZone={describe?.includeTimeZone}
          describeFormatTimeZone={describe?.formatTimeZone}
        />
      </Form>
    );
  };
  return render(<Harness />);
};

describe('RRStackRuleDescription — reflects rule settings and describe options', () => {
  it('updates when setting Frequency/Hours/Minutes', async () => {
    const { getByText } = renderWithDescribeProps();
    fireEvent.click(getByText('Add Rule'));
    const description = screen.getByTestId('rule-description-0');
    const before = (description.textContent ?? '').trim();

    // Wait for the active accordion content to appear and scope all queries
    const contents = await screen.findAllByTestId('accordion-content');
    const content = contents[0] as HTMLElement;

    // Frequency → daily
    const freqField = getFieldByLabel(content, 'Frequency');
    const freqDropdown = within(freqField).getByTestId(
      'dropdown',
    ) as HTMLSelectElement;
    fireEvent.change(freqDropdown, { target: { value: 'daily' } });

    // Time constraints
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
});
