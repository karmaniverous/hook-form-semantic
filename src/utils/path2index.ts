export const path2index = (path: string) => {
  const i = path
    .split(/\./)
    .reverse()
    .find((n) => /\d+/.test(n));

  if (i) return Number(i);
};
