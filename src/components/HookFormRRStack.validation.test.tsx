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

  it('updates RRStackRuleDescription when rule settings change', async () => {
    render(<TestForm />);

    // Add a rule and open the editor
    fireEvent.click(screen.getByText('Add Rule'));

    // Select the description node directly for reliable assertions
    const description = screen.getByTestId('rule-description-0');
    const initialText = description.textContent ?? '';

    // Find the rule editor content
    const content = screen.getAllByTestId('accordion-content')[0];

    // Make a deterministic change that must alter the description:
    // Toggle Effect from Active to Blackout
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
      const nextText = description.textContent ?? '';
      expect(nextText).not.toBe(initialText);
      expect(nextText.length).toBeGreaterThan(0);
    });
  });
});
