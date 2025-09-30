import { render, screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { describe, expect, it } from 'vitest';

import { HookFormField } from './index';

// Test component to use HookFormField
function TestComponent() {
  const { control } = useForm();

  return (
    <HookFormField hookControl={control} hookName="test" label="Test Field">
      <input />
    </HookFormField>
  );
}

describe('library entry (src/index.ts)', () => {
  it('re-exports HookFormField', () => {
    render(<TestComponent />);
    const field = screen.getByTestId('form-field');
    const lbl = field.querySelector('label');
    expect(lbl).toBeTruthy();
    expect(lbl?.textContent?.trim()).toBe('Test Field');
  });
});
