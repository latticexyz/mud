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
        valueSchema: Omit<tableConfigInput["schema"], tableConfigInput["keys"][number]>;
      } & tableConfigInput
    : `Error: keys must be a subset of schema`;

export function resolveTableConfig<tableConfigInput extends TableConfigInput>(
  tableConfigInput: tableConfigInput
): resolveTableConfig<tableConfigInput> {
  // TODO: runtime implementation
  return {} as resolveTableConfig<tableConfigInput>;
}
