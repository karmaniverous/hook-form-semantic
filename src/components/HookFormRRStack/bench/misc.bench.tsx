import { fireEvent, within } from '@testing-library/react';
import { bench, describe } from 'vitest';

import {
  addRuleAndGetContent,
  addRules,
  benchCleanup,
  getFieldByLabel,
  newUser,
  renderRRStack,
} from './bench.utils';

describe('HookFormRRStack (bench: misc)', () => {
  bench('set Frequency → span (Span rule)', async () => {
    const { container } = renderRRStack();
    const { user, content } = await addRuleAndGetContent(container);
    const freqField = getFieldByLabel(content, 'Frequency');
    const freqDropdown = within(freqField).getByTestId('dropdown');
    await user.selectOptions(freqDropdown, 'span');
    benchCleanup();
  });

  bench('clear Interval & Count after setting', async () => {
    const { container } = renderRRStack();
    const { user, content } = await addRuleAndGetContent(container);
    const freqField = getFieldByLabel(content, 'Frequency');
    const freqDropdown = within(freqField).getByTestId('dropdown');
    await user.selectOptions(freqDropdown, 'daily');

    const intervalField = getFieldByLabel(content, 'Interval');
    const intervalInput = within(intervalField).getByRole('spinbutton', {
      name: '',
    });
    fireEvent.change(intervalInput, { target: { value: '3' } });
    fireEvent.change(intervalInput, { target: { value: '' } });

    const countField = getFieldByLabel(content, 'Count');
    const countInput = within(countField).getByRole('spinbutton', { name: '' });
    fireEvent.change(countInput, { target: { value: '7' } });
    fireEvent.change(countInput, { target: { value: '' } });
    benchCleanup();
  });

  bench('change Timezone', async () => {
    const { container } = renderRRStack();
    const { user } = await addRuleAndGetContent(container);
    const tzField = getFieldByLabel(document.body, 'Timezone');
    const tzDropdown = within(tzField).getByTestId('dropdown');
    await user.selectOptions(tzDropdown, 'America/New_York');
    benchCleanup();
  });

  bench('move rules (top/up/down/bottom) and delete', async () => {
    const { container } = renderRRStack();
    await addRules(container, 3);

    // Target the second rule's title row (index 1)
    const titles = Array.from(
      container.querySelectorAll<HTMLElement>(
        '[data-testid="accordion-title"]',
      ),
    );
    const target = titles[1];
    const user =
      new (await import('@testing-library/user-event')).default().setup?.() ??
      undefined;
    // Fallback: use within().getByTitle then fireEvent if user is not available
    const btnTop = within(target).getByTitle('Move to top');
    const btnUp = within(target).getByTitle('Move up');
    const btnDown = within(target).getByTitle('Move down');
    const btnBottom = within(target).getByTitle('Move to bottom');
    const btnDelete = within(target).getByTitle('Delete rule');

    // userEvent preferred; fall back to fireEvent if needed
    if (user && 'click' in user) {
      await user.click(btnTop);
      await user.click(btnDown);
      await user.click(btnBottom);
      await user.click(btnUp);
      await user.click(btnDelete);
    } else {
      fireEvent.click(btnTop);
      fireEvent.click(btnDown);
      fireEvent.click(btnBottom);
      fireEvent.click(btnUp);
      fireEvent.click(btnDelete);
    }
    benchCleanup();
  });
});
