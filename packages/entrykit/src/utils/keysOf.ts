import { unionToTuple } from "@ark/util";

export type keysOf<T extends object> = unionToTuple<keyof T>;

export function keysOf<T extends object>(value: T): keysOf<T> {
  return Object.keys(value) as never;
}
