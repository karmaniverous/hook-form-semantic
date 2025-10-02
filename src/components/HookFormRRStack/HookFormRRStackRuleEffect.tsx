import type { FieldPath, FieldValues, Path } from 'react-hook-form';
import { Dropdown, Form, Input } from 'semantic-ui-react';

import { HookFormField } from '@/components/HookFormField';
import { useHookForm } from '@/hooks/useHookForm';
import type { HookFormProps } from '@/types/HookFormProps';

import { InfoLabel } from './InfoLabel';

const EFFECT_OPTIONS = [
  { key: 'active', text: 'Active', value: 'active' },
  { key: 'blackout', text: 'Blackout', value: 'blackout' },
];

type HookFormRRStackRuleEffectProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = HookFormProps<TFieldValues, TName>;

export const HookFormRRStackRuleEffect = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: HookFormRRStackRuleEffectProps<TFieldValues, TName>,
) => {
  const {
    deprefixed: {
      hook: { name, control },
    },
    rest: { logger },
  } = useHookForm({ props });

  return (
    <Form.Group>
      <HookFormField<TFieldValues, { value: string }>
        control={Input}
        logger={logger}
        hookControl={control}
        hookName={`${name}.label` as Path<TFieldValues>}
        label={
          <InfoLabel
            text="Label"
            help="Optional descriptive name for this rule to help identify its purpose."
          />
        }
        placeholder="Rule label"
        size="small"
        width={12}
      />

      <HookFormField<TFieldValues, { value: 'active' | 'blackout' }>
        compact
        control={Dropdown}
        logger={logger}
        hookControl={control}
        hookName={`${name}.effect` as Path<TFieldValues>}
        label={
          <InfoLabel
            text="Effect"
            help="Active enables windows; Blackout blocks them. Use Blackout to exclude periods."
          />
        }
        options={EFFECT_OPTIONS}
        selection
        width={4}
      />
    </Form.Group>
  );
};
