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

export type mergeIfUndefined<base, defaults> = {
  readonly [key in keyof base | keyof defaults]: key extends keyof base
    ? undefined extends base[key]
      ? key extends keyof defaults
        ? defaults[key]
        : base[key]
      : base[key]
    : key extends keyof defaults
      ? defaults[key]
      : never;
};

export function mergeIfUndefined<base extends object, defaults extends object>(
  base: base,
  defaults: defaults,
): mergeIfUndefined<base, defaults> {
  const keys = [...new Set([...Object.keys(base), ...Object.keys(defaults)])];
  return Object.fromEntries(
    keys.map((key) => [
      key,
      typeof base[key as keyof base] === "undefined" ? defaults[key as keyof defaults] : base[key as keyof base],
    ]),
  ) as never;
}

export type parseNumber<T> = T extends `${infer N extends number}` ? N : never;
