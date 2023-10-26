/**
 * Map each key of a source object via a given valueMap function
 */
export function mapObject<
  Source extends Record<string | number | symbol, unknown>,
  Target extends { [key in keyof Source]: unknown }
>(source: Source, valueMap: (key: keyof Source, value: Source[typeof key]) => Target[typeof key]): Target {
  const target: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(source)) {
    target[key] = valueMap(key, value as Source[keyof Source]);
  }
  return target as Target;
}
