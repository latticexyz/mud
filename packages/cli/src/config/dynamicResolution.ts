export enum DynamicResolutionType {
  TABLE_ID,
}

export type DynamicResulution = {
  type: DynamicResolutionType;
  input: string;
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
