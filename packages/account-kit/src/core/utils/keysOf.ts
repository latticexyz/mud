export type keysOf<T extends object> = readonly (keyof T)[];

export function keysOf<T extends object>(value: T): keysOf<T> {
  return Object.keys(value) as never;
}
