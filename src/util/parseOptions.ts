export interface ParseOptionsParams {
  inputValue: string;
  max: number;
  min: number;
  setValue: (value: string) => void;
}

export const parseOptions = ({
  inputValue,
  max,
  min,
  setValue,
}: ParseOptionsParams) => {
  setValue(inputValue);

  // Parse and validate hours
  const parts = inputValue.split(',').map((v) => v.trim());
  const parsed = parts
    .filter((v) => v !== '') // Only process non-empty parts
    .map((v) => parseInt(v))
    .filter((v) => !isNaN(v) && v >= min && v <= max);

  // Only update rule if input is empty or all non-empty parts are valid
  const nonEmptyParts = parts.filter((v) => v !== '');
  const isValid =
    nonEmptyParts.length === 0 ||
    nonEmptyParts.every((v) => {
      const num = parseInt(v);
      return !isNaN(num) && num >= min && num <= max;
    });

  return [parsed, isValid] as [number[], boolean];
};
