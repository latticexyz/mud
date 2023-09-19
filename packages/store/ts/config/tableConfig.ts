import { SchemaAbiType, StaticAbiType, schemaAbiTypes, staticAbiTypes } from "@latticexyz/schema-type";
import { z } from "zod";

// TODO: combine with protocol-parser def and move up to schema-type?
export type KeySchema = Readonly<Record<string, StaticAbiType>>;
export type ValueSchema = Readonly<Record<string, SchemaAbiType>>;

export type TableType = "table" | "offchainTable";

export type TableConfig = Readonly<{
  type: TableType;
  namespace: string;
  name: string;
  tableId: `0x${string}`;
  keySchema: KeySchema;
  valueSchema: ValueSchema;
  codegen: {
    outputDirectory: string;
    tableIdArgument: boolean;
    storeArgument: boolean;
    dataStruct: boolean;
  };
}>;

const tableSchema = z.object({
  type: z.enum(["table", "offchainTable"]).default("table").optional(),
  namespace: z.string().optional(),
  name: z.string().optional(),
  // TODO: refine/validate key/field names
  keySchema: z.record(z.enum(staticAbiTypes)).default({ key: "bytes32" }).optional(),
  valueSchema: z.record(z.enum(schemaAbiTypes)),
  // TODO: codegen
});

// TODO: refine/validate table names
const tablesSchema = z.record(tableSchema);

const namespaceSchema = z.object({
  tables: tablesSchema.optional(),
});

// TODO: overall codegen options
const configSchema = namespaceSchema.merge(
  z.object({
    // TODO: refine/validate namespace keys
    namespaces: z.record(namespaceSchema).optional(),
  })
);

function storeConfig<TConfig extends z.infer<typeof configSchema>>(
  config: TConfig
): Readonly<{ tables: TableConfig[] }> {
  const parsed = configSchema.parse(config);
  return { tables: [] };
}

const config = storeConfig({
  tables: {
    Position: {
      keySchema: {
        x: "uint32",
        y: "uint32",
      },
      valueSchema: {
        entity: "bytes32",
      },
    },
  },
});
