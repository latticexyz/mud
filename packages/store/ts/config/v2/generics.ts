export type get<input, key> = key extends keyof input ? input[key] : undefined;

export function keyof<const key extends PropertyKey, obj extends object>(
  key: key,
  object: obj,
): object is { [k in key]: k extends keyof typeof object ? obj[k] : unknown } & obj {
  return typeof object === "object" && object !== null && Object.hasOwn(object, key);
}
