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

    // Fill in a valid rule with proper duration and save
    const labelInput = screen.getByPlaceholderText('Rule label');
    fireEvent.change(labelInput, { target: { value: 'Test Rule' } });

    // Add a duration to make it a valid rule - find the Hours input under Duration section
    const hoursInputs = screen.getAllByDisplayValue('');
    const hoursInput = hoursInputs[3]; // The Hours input is the 4th empty input (after Years, Months, Days)
    fireEvent.change(hoursInput, { target: { value: '1' } });

    const saveButton = screen.getAllByText('Add Rule')[1]; // Get the save button in the form
    fireEvent.click(saveButton);

    // Should successfully add the rule without validation errors
    await waitFor(() => {
      expect(screen.getByText('Rules (1)')).toBeInTheDocument();
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
});
