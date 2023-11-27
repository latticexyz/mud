/**
 * Helps parallelize creating/altering tables in tests
 */
export function transformSchemaName(schemaName: string): string {
  if (process.env.NODE_ENV === "test") {
    return `${process.pid}_${process.env.VITEST_POOL_ID}__${schemaName}`;
  }
  return schemaName;
}
