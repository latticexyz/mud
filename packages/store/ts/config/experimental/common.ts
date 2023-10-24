import { SchemaAbiType } from "@latticexyz/schema-type";

export type EmptyObject = { readonly [k: string]: never };

export type Prettify<T> = {
  [K in keyof T as T[K] extends never ? never : K]: T[K];
} & unknown;

export type Merge<Object1, Object2> = Omit<Object1, keyof Object2> & Object2;

/** @internal */
export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    value.constructor === Object &&
    Object.prototype.toString.call(value) === "[object Object]"
  );
}

export type UserTypes = { readonly [k: string]: SchemaAbiType } | undefined;
export type KeyOf<T> = keyof T & string;

export function includes<T>(values: readonly T[], value: unknown): value is T {
  return values.includes(value as T);
}
