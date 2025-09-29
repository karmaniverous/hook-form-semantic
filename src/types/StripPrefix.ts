export type StripPrefix<
  T extends string,
  Prefix extends string,
> = T extends `${Prefix}${infer K}` ? Uncapitalize<K> : never;
