import { Error } from "./error";
import {
  AbiType,
  SchemaConfigInput,
  SchemaFullConfigInput,
  extractStaticAbiKeys,
  resolveSchemaConfig,
} from "./resolveSchemaConfig";

export type TableConfigInput<schema extends SchemaConfigInput = SchemaConfigInput> =
  | TableFullConfigInput<schema>
  | TableShorthandConfigInput;

// TODO: this shorthand is a bit awkward since we don't know what the key is
// we could create a new field on the schema but is that what is expected by the user here?
export type TableShorthandConfigInput = SchemaConfigInput;

export type TableFullConfigInput<schema extends SchemaConfigInput = SchemaConfigInput> =
  schema extends SchemaFullConfigInput
    ? {
        schema: schema;
        keys: extractStaticAbiKeys<schema>[];
      }
    : { schema: { key: "bytes32"; value: SchemaConfigInput }; keys: ["key"] };

export type resolveTableConfig<tableConfigInput extends TableConfigInput> = tableConfigInput extends SchemaConfigInput
  ? // If the table config input is a schema shorthand...
    resolveTableConfig<TableFullConfigInput<tableConfigInput>>
  : tableConfigInput extends TableFullConfigInput<infer schema>
  ? // If the table config input is a full table config
    tableConfigInput["keys"][number] extends extractStaticAbiKeys<schema>
    ? // If the keys are a subset of fields with static ABI
      {
        keySchema: Pick<schema, tableConfigInput["keys"][number]>;
        valueSchema: Omit<resolveSchemaConfig<schema>, tableConfigInput["keys"][number]>;
        schema: resolveSchemaConfig<schema>;
        keys: tableConfigInput["keys"];
      }
    : // Otherwise
      ErrorInvalidKeys<{
        expected: extractStaticAbiKeys<schema>;
        received: tableConfigInput["keys"][number];
      }>
  : tableConfigInput extends TableFullConfigInput
  ? ErrorInvalidKeys<{ expected: keyof tableConfigInput["schema"]; received: tableConfigInput["keys"][number] }>
  : never;

export function resolveTableConfig<tableConfigInput extends TableConfigInput>(
  tableConfigInput: tableConfigInput
): resolveTableConfig<tableConfigInput> {
  // TODO: runtime implementation
  return {} as resolveTableConfig<tableConfigInput>;
}

export type ErrorInvalidKeys<metadata = null> = Error<
  "keys must be a subset of the fields with static ABI types in the schema",
  metadata
>;
