export const getRootName = (name: string, depth: number) =>
  name.split(/\./).slice(0, -depth).join('.');
