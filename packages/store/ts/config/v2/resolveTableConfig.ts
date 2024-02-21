type AbiType = "uint256" | "address" | "bool";

export type SchemaConfigInput = {
  [key: string]: AbiType;
};

export interface TableConfigInput<schema extends SchemaConfigInput = SchemaConfigInput> {
  schema: schema;
  keys: Array<keyof schema>;
}

export type resolveTableConfig<tableConfigInput extends TableConfigInput> =
  tableConfigInput["keys"][number] extends keyof tableConfigInput["schema"]
    ? {
        keySchema: { [key in tableConfigInput["keys"][number]]: tableConfigInput["schema"][key] };
        valueSchema: {
          [key in Exclude<
            keyof tableConfigInput["schema"],
            tableConfigInput["keys"][number]
          >]: tableConfigInput["schema"][key];
        };
      } & tableConfigInput
    : `Error: keys must be a subset of schema`;

export function resolveTableConfig<tableConfigInput extends TableConfigInput>(
  tableConfigInput: tableConfigInput
): resolveTableConfig<tableConfigInput> {
  // TODO: runtime implementation
  return {} as resolveTableConfig<tableConfigInput>;
}
