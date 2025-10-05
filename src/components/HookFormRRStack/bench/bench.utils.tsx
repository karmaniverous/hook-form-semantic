import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { useForm } from 'react-hook-form';
import { Form } from 'semantic-ui-react';

import { HookFormRRStack } from '../HookFormRRStack';
import type { HookFormRRStackData } from '../types';

// Reduce benchmark noise in CI by filtering the specific React act() warning.
// Keep the filter narrow to avoid hiding other issues; enable it only on CI.
if (process?.env?.CI) {
  const __origError = console.error;
  console.error = (...args: unknown[]) => {
    const [first] = args;
    if (typeof first === 'string' && first.includes('not wrapped in act('))
      return;
    __origError(...(args as [unknown, ...unknown[]]));
  };
}

type FormData = { schedule: HookFormRRStackData };

function Harness() {
  const { control } = useForm<FormData>({
    defaultValues: { schedule: { timezone: 'UTC', rules: [] } },
  });
  return (
    <Form>
      <HookFormRRStack<FormData>
        hookControl={control}
        hookName="schedule"
        rrstackRenderDebounce={0}
      />
    </Form>
  );
}

export const renderRRStack = () => render(<Harness />);
export const newUser = () => userEvent.setup();
export const benchCleanup = () => cleanup();

export const getFieldByLabel = (root: HTMLElement, labelText: string) => {
  const fields = Array.from(
    root.querySelectorAll<HTMLElement>('[data-testid="form-field"]'),
  );
  for (const f of fields) {
    const first = f.firstElementChild as HTMLElement | null;
    const txt = (first?.textContent ?? '').trim();
    if (txt.startsWith(labelText)) return f;
  }
  throw new Error(`Field not found: ${labelText}`);
};

export async function addRuleAndGetContent() {
  const user = newUser();
  await user.click(screen.getByText('Add Rule'));
  const content = await screen.findByTestId('accordion-content');
  return { user, content };
}

export async function addRules(count: number) {
  const user = newUser();
  for (let i = 0; i < count; i++) {
    await user.click(screen.getByText('Add Rule'));
  }
  return user;
}
