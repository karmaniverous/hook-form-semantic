interface SyncOptionsParams {
  input: string;
  max: number;
  min: number;
  option: number | number[] | null | undefined;
  setInput: (value: string) => void;
}

export const syncOptions = ({
  input,
  max,
  min,
  option,
  setInput,
}: SyncOptionsParams) => {
  const value = option
    ? Array.isArray(option)
      ? option.join(', ')
      : option.toString()
    : '';

  // Only update local state if rule value changed (don't depend on current input)
  if (input !== value) {
    // Parse current input to compare with rule value
    const currentParsed = input
      .split(',')
      .map((v) => v.trim())
      .filter((v) => v !== '')
      .map((v) => parseInt(v))
      .filter((v) => !isNaN(v) && v >= min && v <= max)
      .sort();

    const ruleParsedHours = Array.isArray(option)
      ? [...option].sort()
      : option
        ? [option]
        : [];

    // Only update if the parsed arrays are actually different
    const arraysEqual =
      currentParsed.length === ruleParsedHours.length &&
      currentParsed.every((val, index) => val === ruleParsedHours[index]);

    if (!arraysEqual) {
      setInput(value);
    }
  }
};
