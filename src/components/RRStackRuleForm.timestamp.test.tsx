import type { RuleJson } from '@karmaniverous/rrstack';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { RRStackRuleForm } from './RRStackRuleForm';

describe('RRStackRuleForm Timestamp Handling', () => {
  const mockRule: RuleJson = {
    effect: 'active',
    duration: {},
    options: {
      freq: 'daily',
    },
    label: 'Test Rule',
  };

  const mockProps = {
    rule: mockRule,
    mode: 'add' as const,
    onRuleChange: vi.fn(),
    onSave: vi.fn(),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sets start date to beginning of day', () => {
    render(<RRStackRuleForm {...mockProps} />);

    const dateInputs = screen
      .getAllByDisplayValue('')
      .filter((input) => input.getAttribute('type') === 'date');
    const startDateInput = dateInputs[0];

    // Simulate user selecting a date
    const testDate = '2024-01-15';
    fireEvent.change(startDateInput, { target: { value: testDate } });

    // Create expected date and set to start of day
    const expectedDate = new Date('2024-01-15');
    expectedDate.setHours(0, 0, 0, 0);

    expect(mockProps.onRuleChange).toHaveBeenCalledWith({
      options: {
        ...mockRule.options,
        starts: expectedDate.getTime(),
      },
    });
  });

  it('sets end date to end of day', () => {
    render(<RRStackRuleForm {...mockProps} />);

    const dateInputs = screen
      .getAllByDisplayValue('')
      .filter((input) => input.getAttribute('type') === 'date');
    const endDateInput = dateInputs[1];

    // Simulate user selecting a date
    const testDate = '2024-01-15';
    fireEvent.change(endDateInput, { target: { value: testDate } });

    // Create expected date and set to end of day
    const expectedDate = new Date('2024-01-15');
    expectedDate.setHours(23, 59, 59, 999);

    expect(mockProps.onRuleChange).toHaveBeenCalledWith({
      options: {
        ...mockRule.options,
        ends: expectedDate.getTime(),
      },
    });
  });

  it('handles clearing dates properly', () => {
    // First set a date, then clear it
    const testDate = new Date('2024-01-15T10:00');
    const ruleWithDate: RuleJson = {
      ...mockRule,
      options: {
        ...mockRule.options,
        starts: testDate.getTime(),
      },
    };

    const propsWithDate = {
      ...mockProps,
      rule: ruleWithDate,
    };

    render(<RRStackRuleForm {...propsWithDate} />);

    // Get the expected display value for date input (YYYY-MM-DD format)
    const expectedDisplayValue = testDate.toISOString().slice(0, 10);

    const dateInputs = screen
      .getAllByDisplayValue(expectedDisplayValue)
      .filter((input) => input.getAttribute('type') === 'date');
    const startDateInput = dateInputs[0];

    // Clear the date
    fireEvent.change(startDateInput, { target: { value: '' } });

    expect(mockProps.onRuleChange).toHaveBeenCalledWith({
      options: {
        ...ruleWithDate.options,
        starts: undefined,
      },
    });
  });

  it('displays helpful labels explaining the default behavior', () => {
    render(<RRStackRuleForm {...mockProps} />);

    expect(screen.getByText('Start Date *')).toBeInTheDocument();
    expect(
      screen.getByText('Defaults to start of day (00:00)'),
    ).toBeInTheDocument();

    expect(screen.getByText('End Date *')).toBeInTheDocument();
    expect(
      screen.getByText('Defaults to end of day (23:59)'),
    ).toBeInTheDocument();
  });

  it('creates proper date range when both dates are selected', () => {
    render(<RRStackRuleForm {...mockProps} />);

    const dateInputs = screen
      .getAllByDisplayValue('')
      .filter((input) => input.getAttribute('type') === 'date');
    const startDateInput = dateInputs[0];
    const endDateInput = dateInputs[1];

    // Set start date (should default to 00:00:00)
    fireEvent.change(startDateInput, { target: { value: '2024-01-15' } });

    // Set end date (should default to 23:59:59.999)
    fireEvent.change(endDateInput, { target: { value: '2024-01-16' } });

    // Create expected dates
    const expectedStartDate = new Date('2024-01-15');
    expectedStartDate.setHours(0, 0, 0, 0);

    const expectedEndDate = new Date('2024-01-16');
    expectedEndDate.setHours(23, 59, 59, 999);

    // Verify start date is beginning of day
    expect(mockProps.onRuleChange).toHaveBeenCalledWith({
      options: {
        ...mockRule.options,
        starts: expectedStartDate.getTime(),
      },
    });

    // Verify end date is end of day
    expect(mockProps.onRuleChange).toHaveBeenCalledWith({
      options: {
        ...mockRule.options,
        ends: expectedEndDate.getTime(),
      },
    });
  });
});
