import type { FieldValues } from 'react-hook-form';

import type { Deprefix } from '@/types/Deprefix';
import type { HookFormProps } from '@/types/HookFormProps';
import type { PickPrefix } from '@/types/PickPrefix';
import type { PickRest } from '@/types/PickRest';

export function deprefixProps<
  T extends FieldValues,
  Props extends HookFormProps<T>,
  const Prefixes extends readonly ['hook', ...(readonly string[])],
>(props: Props, prefixes: Prefixes) {
  type Prefix = Prefixes[number];

  const result = {
    deprefixed: Object.fromEntries(prefixes.map((k) => [k, {}])),
    rest: {},
  } as Deprefix<T, Props, Prefix>;

  for (const key of Object.keys(props)) {
    const match: Prefix | undefined = prefixes.find((p) => key.startsWith(p));

    if (match) {
      const stripped = key.slice(match.length);

      const deprefixedKey = (
        stripped ? stripped[0].toLowerCase() + stripped.slice(1) : stripped
      ) as keyof PickPrefix<Props, Prefix>;

      result.deprefixed[match][deprefixedKey] = props[
        key as keyof Props
      ] as unknown as PickPrefix<Props, Prefix>[keyof PickPrefix<
        Props,
        Prefix
      >];
    } else {
      result.rest[key as keyof PickRest<Props, Prefix>] = props[
        key as keyof Props
      ] as unknown as PickRest<Props, Prefix>[keyof PickRest<Props, Prefix>];
    }
  }

  return result;
}
