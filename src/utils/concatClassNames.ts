export const concatClassNames = (
  ...classNames: (string | undefined)[]
): string => classNames.filter(Boolean).join(' ');
