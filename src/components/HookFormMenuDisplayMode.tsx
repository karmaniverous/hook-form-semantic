import { type FieldValues } from 'react-hook-form';

import { HookFormMenu, type HookFormMenuProps } from './HookFormMenu';

export type DisplayMode = 'card' | 'table' | 'wizard';

export type HookFormMenuDisplayModeProps<T extends FieldValues> = Omit<
  HookFormMenuProps<T>,
  'menuItems'
>;

export const HookFormMenuDisplayMode = <T extends FieldValues>({
  hookName,
  ...props
}: HookFormMenuDisplayModeProps<T>) => (
  <HookFormMenu<T>
    // TECHDEBT: unsafe assignment
    // eslint-disable-next-line
    hookName={hookName}
    menuColor="blue"
    menuCompact
    menuItems={[
      {
        content: <span className="no-mobile">Cards</span>,
        icon: 'th',
        name: 'card',
      },
      {
        content: <span className="no-mobile">Table</span>,
        icon: 'bars',
        name: 'table',
      },
    ]}
    {...props}
  />
);
