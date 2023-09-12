export type Table = {
  schema: Record<string, string>;
  keySchema: Record<string, string>;
  directory: string;
  tableIdArgument: boolean;
  storeArgument: boolean;
  ephemeral: boolean;
  name?: string | undefined;
  dataStruct?: boolean | undefined;
};

export type TableIds = { [tableName: string]: Uint8Array };
