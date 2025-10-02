import React from 'react';
import type {
  StrictCheckboxProps,
  StrictDropdownProps,
} from 'semantic-ui-react';
import { vi } from 'vitest';

// semantic-ui-react lightweight doubles
vi.mock('semantic-ui-react', () => {
  type FormProps = React.PropsWithChildren<
    React.FormHTMLAttributes<HTMLFormElement>
  >;

  const FormComponent: React.FC<FormProps> = ({ children, ...p }) =>
    React.createElement('form', p, children);

  type FieldProps = React.PropsWithChildren<
    React.HTMLAttributes<HTMLDivElement> & {
      error?: string | boolean;
      control?: React.ElementType;
      label?: React.ReactNode;
    }
  >;

  const Field: React.FC<FieldProps> = ({
    children,
    error,
    control,
    label,
    ...p
  }) => {
    const child =
      control != null
        ? React.createElement(control as React.ElementType, { ...p })
        : children;

    const divProps: React.HTMLAttributes<HTMLDivElement> &
      Record<string, unknown> = {
      'data-testid': 'form-field',
      'data-error': error ? String(error) : '',
    };
    const renderedLabel =
      label == null
        ? null
        : typeof label === 'string'
          ? React.createElement('label', undefined, label)
          : (label as React.ReactNode);
    return React.createElement('div', divProps, renderedLabel, child);
  };

  const FormGroup: React.FC<
    React.PropsWithChildren<
      React.HTMLAttributes<HTMLDivElement> & { widths?: string }
    >
  > = ({ children, widths, ...props }) =>
    React.createElement(
      'div',
      { ...props, 'data-testid': 'form-group', 'data-widths': widths },
      children,
    );

  interface FormType extends React.FC<FormProps> {
    Field: React.FC<FieldProps>;
    Group: React.FC<
      React.PropsWithChildren<
        React.HTMLAttributes<HTMLDivElement> & { widths?: string }
      >
    >;
  }

  const Form = Object.assign(FormComponent, {
    Field,
    Group: FormGroup,
  }) as FormType;

  const Label: React.FC<
    React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>
  > = ({ children, ...p }) =>
    React.createElement('div', { ...p, 'data-testid': 'label' }, children);
  (Label as unknown as { displayName?: string }).displayName = 'Label';

  const Input = React.forwardRef<
    HTMLInputElement,
    Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> & {
      onChange?: (
        event: React.SyntheticEvent<HTMLElement>,
        data: { value?: string },
      ) => void;
    }
  >(({ onChange, ...props }, ref) =>
    React.createElement('input', {
      ...props,
      ref,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        if (onChange) onChange(e, { value: e.target.value });
      },
    }),
  );
  (Input as unknown as { displayName?: string }).displayName = 'Input';

  const Checkbox = React.forwardRef<HTMLInputElement, StrictCheckboxProps>(
    ({ onChange, checked, label, ...rest }, ref) =>
      React.createElement(
        'label',
        undefined,
        React.createElement('input', {
          ...(rest as Record<string, unknown>),
          ref,
          type: 'checkbox',
          'aria-label': typeof label === 'string' ? label : 'checkbox',
          checked: !!checked,
          onChange: (e: React.FormEvent<HTMLInputElement>) =>
            onChange?.(e, {
              ...(rest as StrictCheckboxProps),
              checked: (e.target as HTMLInputElement).checked,
            } as StrictCheckboxProps),
        } as React.InputHTMLAttributes<HTMLInputElement>),
        label,
      ),
  );
  (Checkbox as unknown as { displayName?: string }).displayName = 'Checkbox';

  const Dropdown: React.FC<StrictDropdownProps> = ({
    onChange,
    options = [],
    value,
    placeholder,
    multiple,
    ...rest
  }) =>
    React.createElement(
      'select',
      {
        'data-testid': 'dropdown',
        multiple: !!multiple,
        ...rest,
        value:
          value === undefined || value === null
            ? multiple
              ? []
              : ''
            : Array.isArray(value)
              ? (value as Array<string | number>).map((v) => String(v))
              : String(value),
        onChange: (e: React.ChangeEvent<HTMLSelectElement>) => {
          if (multiple) {
            const selected = Array.from(e.currentTarget.selectedOptions ?? []);
            const selectedValues =
              selected.length > 0
                ? selected.map((opt) => opt.value)
                : e.currentTarget.value
                  ? [e.currentTarget.value]
                  : [];
            const vals = selectedValues
              .map(
                (sv) =>
                  (options as unknown as Array<{ value: unknown }>).find(
                    (o) => String(o.value) === sv,
                  )?.value,
              )
              .filter((v) => v !== undefined);
            onChange?.(e, { ...(rest as StrictDropdownProps), value: vals });
          } else {
            const opt = (options as unknown as Array<{ value: unknown }>).find(
              (o) => String(o.value) === e.currentTarget.value,
            );
            onChange?.(e, {
              ...(rest as StrictDropdownProps),
              value: opt?.value,
            });
          }
        },
      } as React.SelectHTMLAttributes<HTMLSelectElement>,
      [
        React.createElement(
          'option',
          { key: '__placeholder__', value: '', disabled: true },
          placeholder ?? '',
        ),
        ...(
          options as unknown as Array<{
            value: unknown;
            text?: React.ReactNode;
            content?: React.ReactNode;
          }>
        ).map((o) =>
          React.createElement(
            'option',
            { key: String(o.value), value: o.value },
            o.text ?? o.content ?? String(o.value),
          ),
        ),
      ],
    );
  (Dropdown as unknown as { displayName?: string }).displayName = 'Dropdown';

  interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    icon?: unknown;
  }
  const Button: React.FC<ButtonProps> = ({ onClick, icon, children, ...r }) =>
    React.createElement(
      'button',
      { ...r, onClick, 'data-icon': String(icon ?? '') },
      children ?? String(icon ?? ''),
    );
  (Button as unknown as { displayName?: string }).displayName = 'Button';

  interface MenuItem {
    name: string;
    content?: React.ReactNode;
  }
  interface MenuProps {
    items?: MenuItem[];
    activeIndex?: number;
    onItemClick?: (
      e: React.SyntheticEvent<HTMLElement>,
      data: { name: string },
    ) => void;
  }
  const Menu: React.FC<MenuProps> = ({
    items = [],
    activeIndex,
    onItemClick,
  }) =>
    React.createElement(
      'div',
      { 'data-testid': 'menu' } as React.HTMLAttributes<HTMLDivElement>,
      items.map((item, idx) =>
        React.createElement(
          'button',
          {
            key: item.name ?? String(idx),
            'data-active': idx === activeIndex ? 'true' : 'false',
            onClick: (e: React.SyntheticEvent<HTMLElement>) =>
              onItemClick?.(e, { name: item.name }),
          } as React.ButtonHTMLAttributes<HTMLButtonElement>,
          item.content ?? item.name,
        ),
      ),
    );

  const Header: React.FC<
    React.PropsWithChildren<
      React.HTMLAttributes<HTMLHeadingElement> & { size?: string }
    >
  > = ({ children, size, ...props }) =>
    React.createElement(
      size === 'small' ? 'h4' : size === 'tiny' ? 'h6' : 'h3',
      props,
      children,
    );

  const Card: React.FC<
    React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>
  > = ({ children, ...props }) =>
    React.createElement('div', { ...props, 'data-testid': 'card' }, children);

  const CardContent: React.FC<
    React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>
  > = ({ children, ...props }) =>
    React.createElement(
      'div',
      { ...props, 'data-testid': 'card-content' },
      children,
    );

  const CardHeader: React.FC<
    React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>
  > = ({ children, ...props }) =>
    React.createElement(
      'div',
      { ...props, 'data-testid': 'card-header' },
      children,
    );

  const CardMeta: React.FC<
    React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>
  > = ({ children, ...props }) =>
    React.createElement(
      'div',
      { ...props, 'data-testid': 'card-meta' },
      children,
    );

  Object.assign(Card, {
    Content: CardContent,
    Header: CardHeader,
    Meta: CardMeta,
  });

  const Icon: React.FC<
    { name?: string } & React.HTMLAttributes<HTMLSpanElement>
  > = ({ name, ...props }) =>
    React.createElement(
      'span',
      { ...props, 'data-testid': 'icon', 'data-name': name },
      name,
    );

  const Message: React.FC<
    React.PropsWithChildren<
      React.HTMLAttributes<HTMLDivElement> & {
        negative?: boolean;
        info?: boolean;
        size?: string;
      }
    >
  > = ({ children, negative, info, size, ...props }) =>
    React.createElement(
      'div',
      {
        ...props,
        'data-testid': 'message',
        'data-negative': negative,
        'data-info': info,
        'data-size': size,
      },
      children,
    );

  const MessageHeader: React.FC<
    React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>
  > = ({ children, ...props }) =>
    React.createElement(
      'div',
      { ...props, 'data-testid': 'message-header' },
      children,
    );

  const MessageContent: React.FC<
    React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>
  > = ({ children, ...props }) =>
    React.createElement(
      'div',
      { ...props, 'data-testid': 'message-content' },
      children,
    );

  Object.assign(Message, { Header: MessageHeader, Content: MessageContent });

  const Segment: React.FC<
    React.PropsWithChildren<
      React.HTMLAttributes<HTMLDivElement> & { basic?: boolean }
    >
  > = ({ children, basic, ...props }) =>
    React.createElement(
      'div',
      { ...props, 'data-testid': 'segment', 'data-basic': basic },
      children,
    );

  const ButtonGroup: React.FC<
    React.PropsWithChildren<
      React.HTMLAttributes<HTMLDivElement> & { size?: string }
    >
  > = ({ children, size, ...props }) =>
    React.createElement(
      'div',
      { ...props, 'data-testid': 'button-group', 'data-size': size },
      children,
    );

  Object.assign(Button, { Group: ButtonGroup });

  interface AccordionTitleProps extends React.HTMLAttributes<HTMLDivElement> {
    active?: boolean;
    index?: number;
    children?: React.ReactNode;
  }

  const AccordionTitle: React.FC<AccordionTitleProps> = ({
    children,
    active,
    index,
    onClick,
    ...props
  }) =>
    React.createElement(
      'div',
      {
        ...props,
        'data-testid': 'accordion-title',
        'data-active': active,
        'data-index': index,
        onClick,
        role: 'button',
        tabIndex: 0,
      },
      children,
    );

  interface AccordionContentProps extends React.HTMLAttributes<HTMLDivElement> {
    active?: boolean;
    children?: React.ReactNode;
  }

  const AccordionContent: React.FC<AccordionContentProps> = ({
    children,
    active,
    ...props
  }) =>
    active
      ? React.createElement(
          'div',
          {
            ...props,
            'data-testid': 'accordion-content',
            'data-active': active,
          },
          children,
        )
      : null;

  interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
    fluid?: boolean;
    styled?: boolean;
    children?: React.ReactNode;
  }

  const Accordion: React.FC<AccordionProps> = ({
    children,
    fluid,
    styled,
    ...props
  }) =>
    React.createElement(
      'div',
      {
        ...props,
        'data-testid': 'accordion',
        'data-fluid': fluid,
        'data-styled': styled,
      },
      children,
    );

  Object.assign(Accordion, {
    Title: AccordionTitle,
    Content: AccordionContent,
  });

  const Container: React.FC<
    React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>
  > = ({ children, ...props }) =>
    React.createElement(
      'div',
      { ...props, 'data-testid': 'container' },
      children,
    );

  const Popup: React.FC<
    React.PropsWithChildren<{
      content?: React.ReactNode;
      trigger?: React.ReactNode;
      position?: string;
      size?: string;
      inverted?: boolean;
    }>
  > = ({ trigger }) => React.createElement(React.Fragment, {}, trigger);

  const GridColumn: React.FC<
    React.PropsWithChildren<
      React.HTMLAttributes<HTMLDivElement> & { width?: number }
    >
  > = ({ children, width, ...props }) =>
    React.createElement(
      'div',
      {
        ...props,
        'data-testid': 'grid-column',
        'data-width': width,
      },
      children,
    );

  interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
    columns?: number;
    stackable?: boolean;
    children?: React.ReactNode;
  }

  const Grid: React.FC<GridProps> = ({
    children,
    columns,
    stackable,
    ...props
  }) =>
    React.createElement(
      'div',
      {
        ...props,
        'data-testid': 'grid',
        'data-columns': columns,
        'data-stackable': stackable,
      },
      children,
    );

  Object.assign(Grid, {
    Column: GridColumn,
  });

  return {
    Form,
    Label,
    Input,
    Checkbox,
    Dropdown,
    Button,
    Menu,
    Header,
    Card,
    Icon,
    Message,
    Segment,
    Accordion,
    Container,
    Popup,
    Grid,
  };
});
