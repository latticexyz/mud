// This is overridden in tests to better parallelize against the same database
export function transformSchemaName(schemaName: string): string {
  return schemaName;
}
