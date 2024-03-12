export type get<input, key> = key extends keyof input ? input[key] : undefined;

export function keyof(key: PropertyKey, object: object): key is keyof object {
  return Object.hasOwn(object, key);
}
