import { MUDError } from "@latticexyz/common/errors";

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

/**
 * Turn a DynamicResolution object into a ValueWithType based on the provided context
 */
export async function resolveWithContext(
  unresolved: any,
  context: { systemAddresses?: Record<string, Promise<string>>; tableIds?: Record<string, Uint8Array> }
): Promise<ValueWithType> {
  if (!isDynamicResolution(unresolved)) return unresolved;
  let resolved: ValueWithType | undefined = undefined;

  if (unresolved.type === DynamicResolutionType.TABLE_ID) {
    const tableId = context.tableIds?.[unresolved.input];
    resolved = tableId && { value: tableId, type: "bytes32" };
  }

  if (resolved === undefined) {
    throw new MUDError(`Could not resolve dynamic resolution: \n${JSON.stringify(unresolved, null, 2)}`);
  }

  return resolved;
}
