import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { describe, expect, it } from 'vitest';

import { HookFormRRStack } from './HookFormRRStack';

const TestForm = () => {
  const { control } = useForm({
    defaultValues: {
      rrstack: {
        timezone: 'America/New_York',
        timeUnit: 'ms' as const,
        rules: [
          {
            effect: 'active' as const,
            duration: { hours: 1 },
            options: { freq: 'daily' as const },
            label: 'Test Rule',
          },
        ],
      },
    },
  });

  return (
    <form>
      <HookFormRRStack
        hookName="rrstack"
        hookControl={control}
        label="RRStack Test"
      />
    </form>
  );
};

describe('HookFormRRStack Delete Confirmation', () => {
  it('shows confirmation dialog when delete button is clicked', async () => {
    render(<TestForm />);

    // Wait for the component to render
    await waitFor(() => {
      expect(screen.getByText('Rules (1)')).toBeInTheDocument();
    });

    // Find and click the delete button
    const deleteButton = screen.getByTitle('Delete rule');
    fireEvent.click(deleteButton);

    // Check that confirmation dialog appears
    await waitFor(() => {
      expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
    });

    expect(screen.getByTestId('confirm-header')).toHaveTextContent(
      'Delete Rule',
    );
    expect(screen.getByTestId('confirm-content')).toHaveTextContent(
      'Are you sure you want to delete "Test Rule"? This action cannot be undone.',
    );
    expect(screen.getByTestId('confirm-cancel')).toHaveTextContent('Cancel');
    expect(screen.getByTestId('confirm-confirm')).toHaveTextContent('Delete');
  });

  it('cancels deletion when cancel button is clicked', async () => {
    render(<TestForm />);

    // Wait for the component to render
    await waitFor(() => {
      expect(screen.getByText('Rules (1)')).toBeInTheDocument();
    });

    // Click delete button to show confirmation
    const deleteButton = screen.getByTitle('Delete rule');
    fireEvent.click(deleteButton);

    // Wait for confirmation dialog
    await waitFor(() => {
      expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
    });

    // Click cancel
    const cancelButton = screen.getByTestId('confirm-cancel');
    fireEvent.click(cancelButton);

    // Confirmation dialog should disappear
    await waitFor(() => {
      expect(screen.queryByTestId('confirm-dialog')).not.toBeInTheDocument();
    });

    // Rule should still exist
    expect(screen.getByText('Rules (1)')).toBeInTheDocument();
  });

  it('deletes rule when confirm button is clicked', async () => {
    render(<TestForm />);

    // Wait for the component to render
    await waitFor(() => {
      expect(screen.getByText('Rules (1)')).toBeInTheDocument();
    });

    // Click delete button to show confirmation
    const deleteButton = screen.getByTitle('Delete rule');
    fireEvent.click(deleteButton);

    // Wait for confirmation dialog
    await waitFor(() => {
      expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
    });

    // Click confirm
    const confirmButton = screen.getByTestId('confirm-confirm');
    fireEvent.click(confirmButton);

    // Confirmation dialog should disappear and rule should be deleted
    await waitFor(() => {
      expect(screen.queryByTestId('confirm-dialog')).not.toBeInTheDocument();
    });

    // Rule count should be 0
    await waitFor(() => {
      expect(screen.getByText('Rules (0)')).toBeInTheDocument();
    });
  });

  it('shows rule name in confirmation dialog for unnamed rules', async () => {
    const TestFormUnnamed = () => {
      const { control } = useForm({
        defaultValues: {
          rrstack: {
            timezone: 'America/New_York',
            timeUnit: 'ms' as const,
            rules: [
              {
                effect: 'active' as const,
                duration: { hours: 1 },
                options: { freq: 'daily' as const },
                label: '', // Empty label
              },
            ],
          },
        },
      });

      return (
        <form>
          <HookFormRRStack
            hookName="rrstack"
            hookControl={control}
            label="RRStack Test"
          />
        </form>
      );
    };

    render(<TestFormUnnamed />);

    // Wait for the component to render
    await waitFor(() => {
      expect(screen.getByText('Rules (1)')).toBeInTheDocument();
    });

    // Click delete button to show confirmation
    const deleteButton = screen.getByTitle('Delete rule');
    fireEvent.click(deleteButton);

    // Check that confirmation dialog shows default rule name
    await waitFor(() => {
      expect(screen.getByTestId('confirm-content')).toHaveTextContent(
        'Are you sure you want to delete "Rule 1"? This action cannot be undone.',
      );
    });
  });
});
