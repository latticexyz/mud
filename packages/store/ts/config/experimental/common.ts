export type EmptyObject = { readonly [k: string]: never };

export type Prettify<T> = {
  [K in keyof T as T[K] extends never ? never : K]: T[K];
} & unknown;

/**
 * Merges two object types into new type
 *
 * @param Object1 - Object to merge into
 * @param Object2 - Object to merge and override keys from {@link Object1}
 * @returns New object type with keys from {@link Object1} and {@link Object2}. If a key exists in both {@link Object1} and {@link Object2}, the key from {@link Object2} will be used.
 *
 * @example
 * type Result = Merge<{ foo: string }, { foo: number; bar: string }>
 * //   ^? type Result = { foo: number; bar: string }
 */
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
