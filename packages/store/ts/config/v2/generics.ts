import { merge } from "@arktype/util";

export type get<input, key> = key extends keyof input ? input[key] : undefined;

export function get<input, key extends PropertyKey>(input: input, key: key): get<input, key> {
  return (typeof input === "object" && input != null && hasOwnKey(input, key) ? input[key] : undefined) as never;
}

export type getPath<input, path extends readonly PropertyKey[]> = path extends readonly [
  infer head,
  ...infer tail extends PropertyKey[],
]
  ? head extends keyof input
    ? getPath<input[head], tail>
    : undefined
  : input;

export function getPath<input, path extends readonly PropertyKey[]>(input: input, path: path): getPath<input, path> {
  return path.length ? (getPath(get(input, path[0]), path.slice(1)) as never) : (input as never);
}

export function hasOwnKey<obj, const key extends PropertyKey>(
  object: obj,
  key: key,
): object is { [k in key]: k extends keyof obj ? obj[k] : unknown } & obj {
  // eslint-disable-next-line no-prototype-builtins
  return typeof object === "object" && object !== null && object.hasOwnProperty(key);
}

export function isObject<input>(input: input): input is input & object {
  return input != null && typeof input === "object";
}

export type mergeIfUndefined<base, merged> = merge<
  base,
  {
    [key in keyof merged]: key extends keyof base
      ? undefined extends base[key]
        ? merged[key]
        : base[key]
      : merged[key];
  }
>;

export function mergeIfUndefined<base extends object, merged extends object>(
  base: base,
  merged: merged,
): mergeIfUndefined<base, merged> {
  const allKeys = [...new Set([...Object.keys(base), ...Object.keys(merged)])];
  return Object.fromEntries(
    allKeys.map((key) => [key, base[key as keyof base] ?? merged[key as keyof merged]]),
  ) as never;
}
