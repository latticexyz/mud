export type get<input, key, defaultValue = undefined> = key extends keyof input ? input[key] : defaultValue;

export function get<input, key extends PropertyKey, defaultValue = undefined>(
  input: input,
  key: key,
  defaultValue: defaultValue = undefined as defaultValue,
): get<input, key, defaultValue> {
  return (typeof input === "object" && input != null && hasOwnKey(input, key) ? input[key] : defaultValue) as get<
    input,
    key,
    defaultValue
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
