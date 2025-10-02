export const isFn = (v: unknown): v is (...args: never[]) => unknown =>
  typeof v === 'function';
