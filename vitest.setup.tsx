import '@testing-library/jest-dom/vitest';

import React from 'react';
import { vi } from 'vitest';

// semantic-ui-react lightweight doubles
vi.mock('semantic-ui-react', () => {
  type FormProps = React.PropsWithChildren<
    React.FormHTMLAttributes<HTMLFormElement>
  >;

  const FormComponent: React.FC<FormProps> = ({ children, ...p }) =>
    React.createElement('form', p, children);

  type FieldProps = React.PropsWithChildren<
    React.HTMLAttributes<HTMLDivElement> & { error?: string | boolean }
  >;

  const Field: React.FC<FieldProps> = ({ children, error, ...p }) => {
    const divProps: React.HTMLAttributes<HTMLDivElement> &
      Record<string, unknown> = {
      ...p,
      'data-testid': 'form-field',
      'data-error': error ? String(error) : '',
    };
    return React.createElement('div', divProps, children);
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
        // Call the semantic-ui onChange
        if (onChange) {
          onChange(e, { value: e.target.value });
        }
      },
    }),
  );

  type CheckboxData = { checked: boolean } & Record<string, unknown>;
  interface CheckboxProps
    extends Omit<
      React.InputHTMLAttributes<HTMLInputElement>,
      'onChange' | 'type' | 'checked'
    > {
    onChange?: (
      e: React.FormEvent<HTMLInputElement>,
      data: CheckboxData,
    ) => void;
    checked?: boolean;
    label?: React.ReactNode;
  }

  const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
    ({ onChange, checked, label, ...rest }, ref) =>
      React.createElement(
        'label',
        undefined,
        React.createElement('input', {
          ...rest,
          ref,
          type: 'checkbox',
          'aria-label': typeof label === 'string' ? label : 'checkbox',
          checked: !!checked,
          onChange: (e: React.FormEvent<HTMLInputElement>) =>
            onChange?.(e, {
              ...rest,
              checked: (e.target as HTMLInputElement).checked,
            }),
        } as React.InputHTMLAttributes<HTMLInputElement>),
        label,
      ),
  );

  type Option = {
    value: string | number;
    text?: string;
    content?: React.ReactNode;
  };
  interface DropdownProps {
    options?: Option[];
    value?: string | number;
    placeholder?: string;
    onChange?: (
      e: React.SyntheticEvent<HTMLElement>,
      data: { value: unknown },
    ) => void;
  }

  const Dropdown: React.FC<DropdownProps> = ({
    onChange,
    options = [],
    value,
    placeholder,
  }) =>
    React.createElement(
      'select',
      {
        'data-testid': 'dropdown',
        value: value === undefined || value === null ? '' : String(value),
        onChange: (e: React.ChangeEvent<HTMLSelectElement>) => {
          const opt = options.find(
            (o) => String(o.value) === e.currentTarget.value,
          );
          onChange?.(e, { value: opt?.value });
        },
      } as React.SelectHTMLAttributes<HTMLSelectElement>,
      [
        React.createElement(
          'option',
          { key: '__placeholder__', value: '', disabled: true },
          placeholder ?? '',
        ),
        ...options.map((o) =>
          React.createElement(
            'option',
            { key: String(o.value), value: o.value },
            o.text ?? o.content ?? String(o.value),
          ),
        ),
      ],
    );

  interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    icon?: unknown;
    primary?: boolean;
    color?: string;
    size?: string;
  }
  const Button: React.FC<ButtonProps> = ({
    onClick,
    icon,
    primary: _primary, // eslint-disable-line @typescript-eslint/no-unused-vars
    color: _color, // eslint-disable-line @typescript-eslint/no-unused-vars
    size: _size, // eslint-disable-line @typescript-eslint/no-unused-vars
    children,
    ...r
  }) =>
    React.createElement(
      'button',
      { ...r, onClick, 'data-icon': String(icon ?? '') },
      children ?? String(icon ?? ''),
    );

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

// Date/time pickers
vi.mock('react-date-picker', () => {
  type Props = {
    onChange?: (value: Date | null) => void;
    dayPlaceholder?: string;
    monthPlaceholder?: string;
    yearPlaceholder?: string;
    showLeadingZeros?: boolean;
    calendarProps?: Record<string, unknown>;
  } & React.InputHTMLAttributes<HTMLInputElement>;
  const Comp: React.FC<Props> = ({
    onChange,
    dayPlaceholder: _dayPlaceholder, // eslint-disable-line @typescript-eslint/no-unused-vars
    monthPlaceholder: _monthPlaceholder, // eslint-disable-line @typescript-eslint/no-unused-vars
    yearPlaceholder: _yearPlaceholder, // eslint-disable-line @typescript-eslint/no-unused-vars
    showLeadingZeros: _showLeadingZeros, // eslint-disable-line @typescript-eslint/no-unused-vars
    calendarProps: _calendarProps, // eslint-disable-line @typescript-eslint/no-unused-vars
    ...p
  }) =>
    React.createElement('input', {
      ...p,
      'data-testid': 'date-picker',
      type: 'date',
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        onChange?.(
          e.currentTarget.value ? new Date(e.currentTarget.value) : null,
        ),
    });
  return { __esModule: true, default: Comp };
});

vi.mock('react-datetime-picker', () => {
  type Props = {
    onChange?: (value: Date | null) => void;
    dayPlaceholder?: string;
    monthPlaceholder?: string;
    yearPlaceholder?: string;
    hourPlaceholder?: string;
    minutePlaceholder?: string;
    secondPlaceholder?: string;
    showLeadingZeros?: boolean;
    disableClock?: boolean;
    maxDetail?: string;
    calendarProps?: Record<string, unknown>;
  } & React.InputHTMLAttributes<HTMLInputElement>;
  const Comp: React.FC<Props> = ({
    onChange,
    dayPlaceholder: _dayPlaceholder, // eslint-disable-line @typescript-eslint/no-unused-vars
    monthPlaceholder: _monthPlaceholder, // eslint-disable-line @typescript-eslint/no-unused-vars
    yearPlaceholder: _yearPlaceholder, // eslint-disable-line @typescript-eslint/no-unused-vars
    hourPlaceholder: _hourPlaceholder, // eslint-disable-line @typescript-eslint/no-unused-vars
    minutePlaceholder: _minutePlaceholder, // eslint-disable-line @typescript-eslint/no-unused-vars
    secondPlaceholder: _secondPlaceholder, // eslint-disable-line @typescript-eslint/no-unused-vars
    showLeadingZeros: _showLeadingZeros, // eslint-disable-line @typescript-eslint/no-unused-vars
    disableClock: _disableClock, // eslint-disable-line @typescript-eslint/no-unused-vars
    maxDetail: _maxDetail, // eslint-disable-line @typescript-eslint/no-unused-vars
    calendarProps: _calendarProps, // eslint-disable-line @typescript-eslint/no-unused-vars
    ...p
  }) =>
    React.createElement('input', {
      ...p,
      'data-testid': 'datetime-picker',
      type: 'datetime-local',
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        onChange?.(
          e.currentTarget.value ? new Date(e.currentTarget.value) : null,
        ),
    });
  return { __esModule: true, default: Comp };
});

vi.mock('@wojtekmaj/react-daterange-picker', () => {
  type Props = {
    onChange?: (value: [Date | null, Date | null]) => void;
    dayPlaceholder?: string;
    monthPlaceholder?: string;
    yearPlaceholder?: string;
    showLeadingZeros?: boolean;
    calendarProps?: Record<string, unknown>;
    rangeDivider?: string;
  } & React.HTMLAttributes<HTMLDivElement>;
  const Comp: React.FC<Props> = ({
    onChange,
    dayPlaceholder: _dayPlaceholder, // eslint-disable-line @typescript-eslint/no-unused-vars
    monthPlaceholder: _monthPlaceholder, // eslint-disable-line @typescript-eslint/no-unused-vars
    yearPlaceholder: _yearPlaceholder, // eslint-disable-line @typescript-eslint/no-unused-vars
    showLeadingZeros: _showLeadingZeros, // eslint-disable-line @typescript-eslint/no-unused-vars
    calendarProps: _calendarProps, // eslint-disable-line @typescript-eslint/no-unused-vars
    rangeDivider: _rangeDivider, // eslint-disable-line @typescript-eslint/no-unused-vars
    ...p
  }) =>
    React.createElement(
      'div',
      { ...p, 'data-testid': 'daterange-picker' },
      React.createElement('input', {
        'data-testid': 'daterange-start',
        type: 'date',
        onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
          onChange?.([
            e.currentTarget.value ? new Date(e.currentTarget.value) : null,
            null,
          ]),
      } as React.InputHTMLAttributes<HTMLInputElement>),
      React.createElement('input', {
        'data-testid': 'daterange-end',
        type: 'date',
        onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
          onChange?.([
            null,
            e.currentTarget.value ? new Date(e.currentTarget.value) : null,
          ]),
      } as React.InputHTMLAttributes<HTMLInputElement>),
    );
  return { __esModule: true, default: Comp };
});

vi.mock('@wojtekmaj/react-datetimerange-picker', () => {
  type Props = {
    onChange?: (value: [Date | null, Date | null]) => void;
  } & React.HTMLAttributes<HTMLDivElement>;
  const Comp: React.FC<Props> = ({ onChange, ...p }) =>
    React.createElement(
      'div',
      { ...p, 'data-testid': 'datetimerange-picker' },
      React.createElement('input', {
        'data-testid': 'datetimerange-start',
        type: 'datetime-local',
        onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
          onChange?.([
            e.currentTarget.value ? new Date(e.currentTarget.value) : null,
            null,
          ]),
      } as React.InputHTMLAttributes<HTMLInputElement>),
      React.createElement('input', {
        'data-testid': 'datetimerange-end',
        type: 'datetime-local',
        onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
          onChange?.([
            null,
            e.currentTarget.value ? new Date(e.currentTarget.value) : null,
          ]),
      } as React.InputHTMLAttributes<HTMLInputElement>),
    );
  return { __esModule: true, default: Comp };
});

// Numeric format
vi.mock('react-number-format', () => {
  interface ValueChange {
    floatValue?: number;
  }
  interface Props
    extends Omit<
      React.InputHTMLAttributes<HTMLInputElement>,
      'onChange' | 'type'
    > {
    onValueChange?: (v: ValueChange) => void;
    allowNegative?: boolean;
    decimalScale?: number;
    customInput?: React.ComponentType<
      React.InputHTMLAttributes<HTMLInputElement>
    >;
  }
  const NumericFormat: React.FC<Props> = ({
    onValueChange,
    allowNegative: _allowNegative, // eslint-disable-line @typescript-eslint/no-unused-vars
    decimalScale: _decimalScale, // eslint-disable-line @typescript-eslint/no-unused-vars
    customInput: _customInput, // eslint-disable-line @typescript-eslint/no-unused-vars
    ...p
  }) =>
    React.createElement('input', {
      ...p,
      'data-testid': 'numeric-input',
      type: 'text',
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = e.currentTarget.value;
        const num = v === '' ? undefined : Number(v);
        onValueChange?.({ floatValue: Number.isNaN(num) ? undefined : num });
      },
    });
  return { NumericFormat };
});

// Phone input and responsive
vi.mock('react-international-phone', () => {
  const parseCountry = (iso2: string) => ({
    iso2,
    name: iso2 === 'ca' ? 'Canada' : 'United States',
    dialCode: '1',
  });
  const defaultCountries = ['us', 'ca'];
  const FlagImage: React.FC<{ iso2: string; size?: number }> = ({ iso2 }) =>
    React.createElement('span', { 'data-iso2': iso2 }, 'flag');
  const getActiveFormattingMask = () => '... ... ....';
  function usePhoneInput(config: {
    value?: string;
    onChange?: (v: {
      country: { iso2: string; name: string; dialCode: string };
      inputValue: string;
      phone: string;
    }) => void;
    defaultCountry?: string;
  }) {
    const [inputValue, setInputValue] = React.useState(config.value || '');
    const [country, setCountryState] = React.useState(
      parseCountry(config.defaultCountry ?? 'us'),
    );

    // Update inputValue when config.value changes
    React.useEffect(() => {
      setInputValue(config.value || '');
    }, [config.value]);

    const phone = inputValue;
    const setCountry = (iso2: string) => {
      const c = parseCountry(iso2);
      setCountryState(c);
      config.onChange?.({ country: c, inputValue, phone });
    };
    const handlePhoneValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.currentTarget.value;
      setInputValue(v);
      config.onChange?.({ country, inputValue: v, phone: v });
    };
    return { inputValue, phone, country, setCountry, handlePhoneValueChange };
  }
  return {
    defaultCountries,
    FlagImage,
    getActiveFormattingMask,
    parseCountry,
    usePhoneInput,
  };
});

let __mobile = false;
vi.mock('react-responsive', () => ({
  useMediaQuery: () => __mobile,
  __setIsMobile: (v: boolean) => {
    __mobile = v;
  },
}));

// vanilla-jsoneditor stub
vi.mock('vanilla-jsoneditor', () => {
  class JSONEditor {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    constructor(_opts: { target: unknown; props: unknown }) {}
    // Simulate change propagation
    updateProps(props: unknown) {
      const onChange = (
        props as { onChange?: (a: unknown, b: unknown, c: unknown) => void }
      ).onChange;
      onChange?.({ json: { from: 'editor' } }, undefined, {});
    }
    destroy() {}
  }
  return { JSONEditor };
});

// WYSIWYG toolchain stubs
vi.mock('html-to-draftjs', () => ({
  __esModule: true,
  default: () => ({ contentBlocks: [], entityMap: {} }),
}));
vi.mock('draftjs-to-html', () => ({
  __esModule: true,
  default: () => '<p>converted</p>',
}));
vi.mock('draft-js', () => {
  const ContentState = {
    createFromBlockArray: (blocks: unknown) => ({ blocks }),
  };
  const EditorState = {
    createEmpty: () => ({ getCurrentContent: () => ({}) }),
    createWithContent: (content: unknown) => ({
      getCurrentContent: () => content,
    }),
  };
  const convertToRaw = (content: unknown) => content;
  return { ContentState, EditorState, convertToRaw };
});
vi.mock('react-draft-wysiwyg', () => ({
  Editor: ({
    onEditorStateChange,
    editorState: _editorState, // eslint-disable-line @typescript-eslint/no-unused-vars
    editorStyle: _editorStyle, // eslint-disable-line @typescript-eslint/no-unused-vars
    ...p
  }: {
    onEditorStateChange?: (s: unknown) => void;
    editorState?: unknown;
    editorStyle?: React.CSSProperties;
  } & React.HTMLAttributes<HTMLDivElement>) =>
    React.createElement('div', {
      ...p,
      'data-testid': 'rdw-editor',
      onClick: () => onEditorStateChange?.({ getCurrentContent: () => ({}) }),
    }),
}));
