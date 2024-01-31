/**
 * Map each key of a source object via a given valueMap function
 */
export function mapObject<
  Source extends Record<string | number | symbol, unknown>,
  Target extends { [key in keyof Source]: unknown }
>(source: Source, valueMap: (value: Source[typeof key], key: keyof Source) => Target[typeof key]): Target {
  return Object.fromEntries(
    Object.entries(source).map(([key, value]) => [key, valueMap(value as Source[keyof Source], key)])
  ) as Target;
}
