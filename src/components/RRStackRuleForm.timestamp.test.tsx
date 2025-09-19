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

  it('sets start date without automatic time adjustment', () => {
    render(<RRStackRuleForm {...mockProps} />);

    const dateInputs = screen.getAllByTestId('date-picker');
    const startDateInput = dateInputs[0];

    // Simulate user selecting a date
    const testDate = '2024-01-15';
    fireEvent.change(startDateInput, { target: { value: testDate } });

    // Create expected date - should preserve the time as entered (no automatic start-of-day)
    const expectedDate = new Date('2024-01-15');

    expect(mockProps.onRuleChange).toHaveBeenCalledWith({
      options: {
        ...mockRule.options,
        starts: expectedDate.getTime(),
      },
    });
  });

  it('sets end date without automatic time adjustment', () => {
    render(<RRStackRuleForm {...mockProps} />);

    const dateInputs = screen.getAllByTestId('date-picker');
    const endDateInput = dateInputs[1];

    // Simulate user selecting a date
    const testDate = '2024-01-15';
    fireEvent.change(endDateInput, { target: { value: testDate } });

    // Create expected date - should preserve the time as entered (no automatic end-of-day)
    const expectedDate = new Date('2024-01-15');

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

    // Get the date picker inputs
    const dateInputs = screen.getAllByTestId('date-picker');
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

  it('displays date picker fields with Include Time checkboxes', () => {
    render(<RRStackRuleForm {...mockProps} />);

    expect(screen.getByText('Start Date *')).toBeInTheDocument();
    expect(screen.getByText('End Date *')).toBeInTheDocument();

    // Check for Include Time checkboxes
    const includeTimeCheckboxes = screen.getAllByText('Include Time');
    expect(includeTimeCheckboxes).toHaveLength(2);
  });

  it('creates proper date range when both dates are selected', () => {
    render(<RRStackRuleForm {...mockProps} />);

    const dateInputs = screen.getAllByTestId('date-picker');
    const startDateInput = dateInputs[0];
    const endDateInput = dateInputs[1];

    // Set start date (no automatic time adjustment)
    fireEvent.change(startDateInput, { target: { value: '2024-01-15' } });

    // Set end date (no automatic time adjustment)
    fireEvent.change(endDateInput, { target: { value: '2024-01-16' } });

    // Create expected dates - preserve time as entered
    const expectedStartDate = new Date('2024-01-15');
    const expectedEndDate = new Date('2024-01-16');

    // Verify start date preserves entered time
    expect(mockProps.onRuleChange).toHaveBeenCalledWith({
      options: {
        ...mockRule.options,
        starts: expectedStartDate.getTime(),
      },
    });

    // Verify end date preserves entered time
    expect(mockProps.onRuleChange).toHaveBeenCalledWith({
      options: {
        ...mockRule.options,
        ends: expectedEndDate.getTime(),
      },
    });
  });
});
