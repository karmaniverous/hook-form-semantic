export type StripPrefix<
  Key extends string,
  Prefix extends string,
> = Key extends `${Prefix}${infer K}` ? Uncapitalize<K> : never;
