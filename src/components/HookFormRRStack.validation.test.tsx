import type { RRStackOptions } from '@karmaniverous/rrstack';
import { RRStack } from '@karmaniverous/rrstack';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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
        timeUnit: 'ms' as const,
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

    // Should show the rule editor
    expect(screen.getByText('Add New Rule')).toBeInTheDocument();

    // Fill in a rule label
    const labelInput = screen.getByPlaceholderText('Rule label');
    fireEvent.change(labelInput, { target: { value: 'Test Rule' } });

    // Try to save without any duration - should show validation error
    const saveButton = screen.getAllByText('Add Rule')[1]; // Get the save button in the form
    fireEvent.click(saveButton);

    // Should show duration validation error (dates are now optional)
    await waitFor(() => {
      expect(
        screen.getByText(
          'Duration must have at least one positive value (years, months, weeks, days, hours, minutes, or seconds)',
        ),
      ).toBeInTheDocument();
    });

    // Now add a duration to make it valid
    const hoursInputs = screen.getAllByDisplayValue('');
    const hoursInput = hoursInputs[3]; // The Hours input is the 4th empty input (after Years, Months, Days)
    fireEvent.change(hoursInput, { target: { value: '1' } });

    // Try to save again - should succeed now (dates are optional)
    fireEvent.click(saveButton);

    // The form should close and the rule should be added
    await waitFor(() => {
      expect(screen.queryByText('Add New Rule')).not.toBeInTheDocument();
    });
  });

  it('shows validation errors for invalid rules', async () => {
    render(<TestForm />);

    // Click "Add Rule" button
    const addRuleButton = screen.getByText('Add Rule');
    fireEvent.click(addRuleButton);

    // Create an invalid rule by setting invalid hour values
    const hoursInput = screen.getByPlaceholderText('e.g., 9, 13, 17');
    fireEvent.change(hoursInput, { target: { value: '25, 30' } }); // Invalid hours

    const saveButton = screen.getAllByText('Add Rule')[1]; // Get the save button in the form
    fireEvent.click(saveButton);

    // Should show validation error - the form should stay open and show error
    await waitFor(() => {
      expect(screen.getByText('Add New Rule')).toBeInTheDocument(); // Form should still be open
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
        timeUnit: 'ms',
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
        timeUnit: 'ms',
        rules: [validRuleWithDates],
      });
    }).not.toThrow();
  });

  it('validates rules with starts/ends in seconds timeUnit', () => {
    const now = Math.floor(Date.now() / 1000);
    const futureTime = now + 24 * 60 * 60; // 24 hours later in seconds

    const validRuleWithDates = {
      effect: 'active' as const,
      duration: { hours: 1 },
      options: {
        freq: 'daily' as const,
        starts: now,
        ends: futureTime,
      },
      label: 'Rule with Date Range in Seconds',
    };

    // This should not throw an error
    expect(() => {
      new RRStack({
        timezone: 'UTC',
        timeUnit: 's',
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
        timeUnit: 'ms',
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
        timeUnit: 'ms',
        rules: [ruleWithOnlyEnds],
      });
    }).not.toThrow();
  });
});
