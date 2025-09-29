export type Logger =
  | ((...args: unknown[]) => void)
  | boolean
  | null
  | undefined;
