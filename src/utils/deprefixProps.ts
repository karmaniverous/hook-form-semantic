import type { Deprefix } from '@/types/Deprefix';
import type { HookFormProps } from '@/types/HookFormProps';

export const deprefixProps = <
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Props extends HookFormProps<any>,
  const Prefix extends string = never,
>(
  props: Props,
  prefixes: readonly Prefix[],
) => {
  type PrefixWithHook = 'hook' | Prefix;

  const prefixesWithHook = ['hook', ...prefixes] as const;

  const result = {
    deprefixed: Object.fromEntries(prefixesWithHook.map((k) => [k, {}])),
    rest: {},
  } as Deprefix<Props, PrefixWithHook>;

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
};
