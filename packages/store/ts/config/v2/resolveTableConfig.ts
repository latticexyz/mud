export type SchemaConfigInput<keys extends string> = {
  [key in keys]: string;
};

export interface TableConfigInput<keys extends string = string> {
  keys: keys[];
  schema: SchemaConfigInput<keys>;
}

export type resolveTableConfig<tableConfigInput extends TableConfigInput> =
  tableConfigInput["keys"][number] extends keyof tableConfigInput["schema"]
    ? {
        keySchema: { [key in tableConfigInput["keys"][number]]: tableConfigInput["schema"][key] };
      }
    : "Error: keys must be a subset of schema";

function resolveTableConfig<tableConfigInput extends TableConfigInput>(
  tableConfigInput: tableConfigInput
): resolveTableConfig<tableConfigInput> {
  // TODO
  return {} as resolveTableConfig<tableConfigInput>;
}

const resolved = resolveTableConfig({ schema: { x: "uint256", y: "uint256" }, keys: ["y"] } as const);
resolved.keySchema;
//       ^?
