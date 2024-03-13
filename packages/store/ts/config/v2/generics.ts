export type get<input, key> = key extends keyof input ? input[key] : undefined;

export function get<input, key extends PropertyKey>(input: input, key: key): get<input, key> {
  return (typeof input === "object" && input != null && hasOwnKey(input, key) ? input[key] : undefined) as get<
    input,
    key
  >;
}

export function hasOwnKey<obj extends object, const key extends PropertyKey>(
  object: obj,
  key: key,
): object is { [k in key]: k extends keyof obj ? obj[k] : unknown } & obj {
  // eslint-disable-next-line no-prototype-builtins
  return typeof object === "object" && object !== null && object.hasOwnProperty(key);
}

export function isObject<input>(input: input): input is input & object {
  return input != null && typeof input === "object";
}
