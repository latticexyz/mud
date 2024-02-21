import { SchemaConfigInput, resolveSchemaConfig } from "./resolveSchemaConfig";

export interface TableConfigInput<keys extends string = string> {
  schema: SchemaConfigInput<keys>;
  keys: keys[];
}

export type resolveTableConfig<tableConfigInput extends TableConfigInput> = tableConfigInput extends TableConfigInput<
  infer keys
>
  ? keys extends keyof resolveSchemaConfig<tableConfigInput["schema"], keys>
    ? {
        keySchema: Pick<resolveSchemaConfig<tableConfigInput["schema"], keys>, keys>;
        valueSchema: Omit<resolveSchemaConfig<tableConfigInput["schema"], keys>, keys>;
        schema: resolveSchemaConfig<tableConfigInput["schema"]>;
        keys: tableConfigInput["keys"];
      }
    : `Error: keys must be a subset of schema`
  : never;

export function resolveTableConfig<tableConfigInput extends TableConfigInput>(
  tableConfigInput: tableConfigInput
): resolveTableConfig<tableConfigInput> {
  // TODO: runtime implementation
  return {} as resolveTableConfig<tableConfigInput>;
}
