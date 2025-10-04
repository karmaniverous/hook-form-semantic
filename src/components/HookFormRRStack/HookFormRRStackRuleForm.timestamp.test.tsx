import { render, screen } from '@testing-library/react';
import { type Path, useForm } from 'react-hook-form';
import { describe, expect, it } from 'vitest';

import { HookFormRRStackRuleForm } from './HookFormRRStackRuleForm';

describe('HookFormRRStackRuleForm Timestamp Handling', () => {
  // Updated harness to reflect current API: no rrstack/index props; provide
  // a minimal default rule under schedule.rules.0 so the form has context.
  const Harness = () => {
    const { control } = useForm<{
      schedule: {
        timezone: string;
        rules: Array<{
          effect: 'active' | 'blackout';
          duration?: Record<string, number>;
          options: Record<string, unknown>;
          label?: string;
        }>;
      };
    }>({
      defaultValues: {
        schedule: {
          timezone: 'UTC',
          rules: [
            {
              effect: 'active',
              duration: {},
              options: { freq: 'daily' },
              label: 'Test Rule',
            },
          ],
        },
      },
    });
    return (
      <HookFormRRStackRuleForm
        hookControl={control}
        hookName={
          'schedule.rules.0' as Path<{
            schedule: unknown;
          }>
        }
      />
    );
  };

  it('renders start and end date fields', () => {
    render(<Harness />);
    expect(screen.getByText('Start Date')).toBeInTheDocument();
    expect(screen.getByText('End Date')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Rule label')).toBeInTheDocument();
  });
});
