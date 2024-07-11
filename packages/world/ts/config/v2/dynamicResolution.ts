import { World } from "./output";

export type DynamicResolution = {
  // TODO: add systemAddress support
  type: "tableId";
  input: string;
};

export type ValueWithType = {
  value: string | number | Uint8Array;
  type: string;
};

/**
 * Dynamically resolve a table name to a table id at deploy time
 */
export function resolveTableId(tableName: string) {
  return {
    type: "tableId",
    input: tableName,
  } as const;
}

/** Type guard for DynamicResolution */
export function isDynamicResolution(value: unknown): value is DynamicResolution {
  return typeof value === "object" && value !== null && "type" in value && "input" in value;
}

/** Type guard for ValueWithType */
export function isValueWithType(value: unknown): value is ValueWithType {
  return typeof value === "object" && value !== null && "type" in value && "value" in value;
}

/**
 * Turn a DynamicResolution object into a ValueWithType based on the provided context
 */
export function resolveWithContext(
  input: unknown,
  context: { config: World; systemAddresses?: Record<string, Promise<string>> },
): ValueWithType {
  if (isValueWithType(input)) return input;

  if (isDynamicResolution(input)) {
    if (input.type === "tableId") {
      const tableEntries = Object.entries(context.config.tables).filter(
        ([tableName, table]) => tableName === input.input || table.name === input.input,
      );

      if (tableEntries.length > 1) {
        throw new Error(
          `Found more than one table with name "${input.input}". Try using one of the following table names instead: ${tableEntries.map(([tableName]) => tableName).join(", ")}`,
        );
      }

      if (tableEntries.length === 1) {
        const [entry] = tableEntries;
        const [, table] = entry;
        return { type: "bytes32", value: table.tableId };
      }
    }
  }

  throw new Error(`Could not resolve dynamic resolution:\n${JSON.stringify(input, null, 2)}`);
}
