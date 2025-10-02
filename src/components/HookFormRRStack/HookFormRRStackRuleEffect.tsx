import type { FieldValues, Path } from 'react-hook-form';
import { Dropdown, Form, Input } from 'semantic-ui-react';

import { HookFormField } from '@/components/HookFormField';
import { useHookForm } from '@/hooks/useHookForm';
import type { HookFormProps } from '@/types/HookFormProps';

import { InfoLabel } from './InfoLabel';

const EFFECT_OPTIONS = [
  { key: 'active', text: 'Active', value: 'active' },
  { key: 'blackout', text: 'Blackout', value: 'blackout' },
];

type HookFormRRStackRuleEffectProps<T extends FieldValues = FieldValues> =
  HookFormProps<T>;

export const HookFormRRStackRuleEffect = <T extends FieldValues = FieldValues>(
  props: HookFormRRStackRuleEffectProps<T>,
) => {
  const {
    deprefixed: {
      hook: { name, control },
    },
  } = useHookForm({ props });

  return (
    <Form.Group>
      <HookFormField<T, { value: string }>
        control={Input}
        hookControl={control}
        hookName={`${name}.label` as Path<T>}
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

      <HookFormField<T, { value: 'active' | 'blackout' }>
        compact
        control={Dropdown}
        hookControl={control}
        hookName={`${name}.effect` as Path<T>}
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
