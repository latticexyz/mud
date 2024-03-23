export enum DynamicResolutionType {
  TABLE_ID,
  SYSTEM_ADDRESS,
}

export type DynamicResolution = {
  type: DynamicResolutionType;
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
    type: DynamicResolutionType.TABLE_ID,
    input: tableName,
  };
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
  context: { systemAddresses?: Record<string, Promise<string>>; tableIds?: Record<string, Uint8Array> },
): ValueWithType {
  if (isValueWithType(input)) return input;

  if (isDynamicResolution(input)) {
    let resolved: ValueWithType | undefined = undefined;

    if (input.type === DynamicResolutionType.TABLE_ID) {
      const tableId = context.tableIds?.[input.input];
      resolved = tableId && { value: tableId, type: "bytes32" };
    }

    if (resolved) return resolved;
  }

  throw new Error(`Could not resolve dynamic resolution: \n${JSON.stringify(input, null, 2)}`);
}
