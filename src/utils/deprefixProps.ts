import type { FieldValues } from 'react-hook-form';

import type { Deprefix } from '@/types/Deprefix';
import type { HookFormProps } from '@/types/HookFormProps';

export function deprefixProps<
  T extends FieldValues,
  Props extends HookFormProps<T>,
  const Prefix extends string,
>(props: Props, prefixes: readonly Prefix[]) {
  type PrefixWithHook = 'hook' | Prefix;

  const prefixesWithHook = ['hook', ...prefixes] as const;

  const result = {
    deprefixed: Object.fromEntries(prefixesWithHook.map((k) => [k, {}])),
    rest: {},
  } as Deprefix<T, Props, PrefixWithHook>;

  for (const key of Object.keys(props)) {
    const match: PrefixWithHook | undefined = prefixesWithHook.find((p) =>
      key.startsWith(p),
    );

    if (match) {
      const stripped = key.slice(match.length);

      const deprefixedKey = stripped
        ? stripped[0].toLowerCase() + stripped.slice(1)
        : stripped;

      // @ts-expect-error Deprefixing logic
      result.deprefixed[match][deprefixedKey] = props[key];
    } else
      // @ts-expect-error Rest logic
      result.rest[key] = props[key];
  }

  return result;
}
