export type EmptyObject = { [k: string]: never };

export type Prettify<T> = {
  [K in keyof T as T[K] extends never ? never : K]: T[K];
} & unknown;

/** @internal */
export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    value.constructor === Object &&
    Object.prototype.toString.call(value) === "[object Object]"
  );
}
