export type mergeRight<left, right> = {
  readonly [key in keyof left | keyof right]: key extends keyof right
    ? right[key]
    : key extends keyof left
      ? left[key]
      : never;
};
