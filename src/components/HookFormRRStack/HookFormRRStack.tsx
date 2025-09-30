import { RRStack } from '@karmaniverous/rrstack';
import {
  useRRStack,
  type UseRRStackOutput,
  type UseRRStackProps,
} from '@karmaniverous/rrstack/react';
import { omit } from 'radash';
import { useCallback, useMemo, useState } from 'react';
import { type FieldValues, type Path } from 'react-hook-form';
import {
  Accordion,
  Button,
  Dropdown,
  Form,
  type FormFieldProps,
  Header,
  Icon,
  Label,
  Message,
  Segment,
} from 'semantic-ui-react';

import { HookFormField } from '@/components/HookFormField';
import { useHookForm } from '@/hooks/useHookForm';
import type { HookFormProps } from '@/types/HookFormProps';
import { reprefix } from '@/types/PrefixedPartial';
import type { PrefixProps } from '@/types/PrefixProps';
import { concatClassNames } from '@/utils/concatClassNames';

import { HookFormRRStackRule } from './HookFormRRStackRule';
import type { RRStackRuleDescriptionPropsBase } from './RRStackRuleDescription';
import { timezoneOptions } from './timezoneOptions';

export interface HookFormRRStackProps<T extends FieldValues>
  extends HookFormProps<T>,
    Omit<
      FormFieldProps,
      | 'as'
      | 'children'
      | 'content'
      | 'control'
      | 'checked'
      | 'disabled'
      | 'error'
      | 'inline'
      | 'name'
      | 'onBlur'
      | 'onChange'
      | 'ref'
      | 'type'
      | 'value'
    >,
    PrefixProps<
      Omit<RRStackRuleDescriptionPropsBase, 'index' | 'rrstack'>,
      'describe'
    >,
    PrefixProps<Omit<UseRRStackProps, 'json' | 'timezone'>, 'rrstack'> {
  timestampFormat?: string;
}

export const HookFormRRStack = <T extends FieldValues>(
  props: HookFormRRStackProps<T>,
) => {
  const {
    controller: {
      field: { onChange: hookFieldOnChange, value, ...hookFieldProps },
      fieldState: { error },
    },
    deprefixed: {
      describe: describeProps,
      rrstack: { onChange: rrstackOnChange, ...rrstackProps },
    },
    rest: {
      className,
      label,
      timestampFormat = 'yyyy-MM-dd HH:mm:ss',
      ...fieldProps
    },
  } = useHookForm({ props, prefixes: ['describe', 'rrstack'] as const });

  const reprifixedDescribeProps = useMemo(
    () => reprefix(describeProps, 'describe'),
    [describeProps],
  );

  // ---------- Mapping helpers: UI (form) <-> Engine (rrstack) ----------
  type UiSchedule = unknown; // use structural typing; runtime mapping only
  type EngineSchedule = unknown;

  const parseCsvInts = (
    text?: string | null,
    min = -Infinity,
    max = Infinity,
  ) => {
    if (!text) return undefined;
    const vals = String(text)
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length)
      .map((s) => Number.parseInt(s, 10))
      .filter((n) => Number.isFinite(n) && n >= min && n <= max) as number[];
    return vals.length ? vals : undefined;
  };

  const intsToCsv = (arr?: number[] | null) =>
    !arr || arr.length === 0 ? '' : arr.join(', ');

  const isValidTz = (tz?: string) => !!tz && RRStack.isValidTimeZone(tz);

  const uiToEngine = (ui: any): any => {
    if (!ui || typeof ui !== 'object') return ui;
    const timezone = isValidTz(ui.timezone) ? ui.timezone : 'UTC';
    return {
      timezone,
      rules: Array.isArray(ui.rules)
        ? ui.rules.map((r: any) => {
            const opts = r?.options ?? {};
            const freq = opts?.freq === 'span' ? undefined : opts?.freq;
            const starts =
              opts?.starts instanceof Date ? opts.starts.getTime() : undefined;
            const ends =
              opts?.ends instanceof Date ? opts.ends.getTime() : undefined;

            return {
              label: r?.label ?? undefined,
              effect: r?.effect ?? 'active',
              duration: r?.duration ?? undefined,
              options: {
                ...opts,
                freq,
                starts,
                ends,
                // pass through arrays as-is
                bymonth: opts?.bymonth ?? undefined,
                byweekday: opts?.byweekday ?? undefined,
                bysetpos: opts?.bysetpos ?? undefined,
                // map tolerant text to arrays
                bymonthday: parseCsvInts(opts?.bymonthdayText, 1, 31),
                byhour: parseCsvInts(opts?.byhourText, 0, 23),
                byminute: parseCsvInts(opts?.byminuteText, 0, 59),
              },
            };
          })
        : [],
    };
  };

  const engineToUi = (engine: any): any => {
    if (!engine || typeof engine !== 'object') return engine;
    return {
      timezone: engine.timezone,
      rules: Array.isArray(engine.rules)
        ? engine.rules.map((r: any) => {
            const opts = r?.options ?? {};
            const freq = opts?.freq ?? 'span';
            const starts =
              typeof opts?.starts === 'number' ? new Date(opts.starts) : null;
            const ends =
              typeof opts?.ends === 'number' ? new Date(opts.ends) : null;
            return {
              label: r?.label ?? undefined,
              effect: r?.effect ?? 'active',
              duration: r?.duration ?? undefined,
              options: {
                ...opts,
                freq,
                starts,
                ends,
                // arrays stay arrays
                bymonth: opts?.bymonth ?? undefined,
                byweekday: opts?.byweekday ?? undefined,
                bysetpos: opts?.bysetpos ?? undefined,
                // arrays -> tolerant text strings
                bymonthdayText: intsToCsv(opts?.bymonthday),
                byhourText: intsToCsv(opts?.byhour),
                byminuteText: intsToCsv(opts?.byminute),
              },
            };
          })
        : [],
    };
  };

  // ---------- RHF value (UI shape) -> rrstack (engine shape) ----------
  const uiValue = value as UiSchedule;
  const engineJson = useMemo(() => uiToEngine(uiValue), [uiValue]);

  const handleChange = useCallback(
    (stack: UseRRStackOutput['rrstack']) => {
      rrstackOnChange?.(stack);
      const engine = stack.toJson();
      const uiNext = engineToUi(engine);
      hookFieldOnChange({ target: { value: uiNext } });
    },
    [hookFieldOnChange, rrstackOnChange],
  );

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const [validationErrors, setValidationErrors] = useState<{
    timezone?: string;
  }>({});

  const { rrstack } = useRRStack({
    json: engineJson,
    onChange: handleChange,
    ...rrstackProps,
  });

  const { starts, ends } = useMemo(() => {
    const formatTimestamp = (ts: number | null | undefined) =>
      ts ? rrstack.formatInstant(ts, { format: timestampFormat }) : 'Not Set';

    const { start, end } = rrstack.getEffectiveBounds();

    return {
      starts: formatTimestamp(start),
      ends: formatTimestamp(end),
    };
  }, [rrstack.rules, rrstack.timezone, timestampFormat]);

  const uiTimezone = (uiValue as any)?.timezone as string | undefined;
  const timezoneError =
    uiTimezone && !RRStack.isValidTimeZone(uiTimezone)
      ? `Invalid timezone: ${uiTimezone}`
      : undefined;
  // Track for inline label
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useMemo(
    () => setValidationErrors((p) => ({ ...p, timezone: timezoneError })),
    [timezoneError],
  );

  const handleAddRule = useCallback(() => {
    rrstack.addRule();
    setActiveIndex(rrstack.rules.length - 1);
  }, [rrstack]);

  // Show loading state while RRStack is initializing
  if (!rrstack) {
    return (
      <Form.Field>
        {fieldProps.label && <label>{fieldProps.label}</label>}
        <Message info size="small">
          <Message.Header>Loading</Message.Header>
          <Message.Content>Initializing RRStack...</Message.Content>
        </Message>
      </Form.Field>
    );
  }

  return (
    <Form.Field
      {...fieldProps}
      {...omit(hookFieldProps as Record<string, unknown>, ['ref'])}
      className={concatClassNames(className, 'hook-form-rrstack')}
    >
      {label && <label>{label}</label>}

      {/* Display validation errors */}
      {error?.message && (
        <Message negative size="small" style={{ marginBottom: 16 }}>
          <Message.Header>Validation Error</Message.Header>
          <Message.Content>{error.message}</Message.Content>
        </Message>
      )}

      <Segment basic style={{ padding: '0 0 1em 0' }}>
        <Form.Group widths={'equal'}>
          <HookFormField<T, { value: string }>
            control={Dropdown}
            hookControl={props.hookControl}
            hookName={`${props.hookName as Path<T>}.timezone` as Path<T>}
            label="Timezone"
            placeholder="Select timezone"
            dropdownOptions={timezoneOptions}
            dropdownSelection
            dropdownSearch
            error={!!validationErrors.timezone}
          />
          {validationErrors.timezone && (
            <Label basic color="red" pointing>
              {validationErrors.timezone}
            </Label>
          )}

          <Form.Field>
            <label>Starts</label>
            {starts}
          </Form.Field>

          <Form.Field>
            <label>Ends</label>
            {ends}
          </Form.Field>
        </Form.Group>
      </Segment>

      <Segment
        basic
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Header size="small">Rules ({rrstack.rules.length})</Header>
        <Button type="button" primary onClick={handleAddRule} size="small">
          <Icon name="plus" />
          Add Rule
        </Button>
      </Segment>

      {rrstack.rules.length ? (
        <Accordion fluid styled>
          {rrstack.rules.map((rule, index) => (
            <HookFormRRStackRule<T>
              {...reprifixedDescribeProps}
              activeIndex={activeIndex}
              index={index}
              key={index}
              onClick={() =>
                setActiveIndex(activeIndex === index ? null : index)
              }
              rrstack={rrstack}
              setActiveIndex={setActiveIndex}
              hookControl={props.hookControl}
              hookNameBase={props.hookName}
            />
          ))}
        </Accordion>
      ) : (
        <Message info size="small">
          <Message.Header>No rules defined</Message.Header>
          <Message.Content>
            Add your first rule to start building your schedule.
          </Message.Content>
        </Message>
      )}
    </Form.Field>
  );
};
