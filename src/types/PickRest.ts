export type PickRest<
  Props extends Record<string, unknown>,
  Prefix extends string,
> = {
  [K in keyof Props as K extends `${Prefix}${string}` ? never : K]: Props[K];
};
