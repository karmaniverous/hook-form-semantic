export type PickRest<T, Prefixes extends string> = {
  [K in keyof T as K extends `${Prefixes}${string}` ? never : K]: T[K];
};
