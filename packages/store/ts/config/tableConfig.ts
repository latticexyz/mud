import { tableIdToHex } from "@latticexyz/common";
import { SchemaAbiType, StaticAbiType, schemaAbiTypes, staticAbiTypes } from "@latticexyz/schema-type";
import { ZodAny, ZodTypeAny, z } from "zod";

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

const configSchema = z.object({
  namespace: z.string().default(""),
  // TODO: refine/validate table names
  tables: z
    .record(
      z.string(),
      z.object({
        type: z.enum(["table", "offchainTable"]).default("table"),
        namespace: z.string().optional(),
        // TODO: refine/validate key/field names
        keySchema: z.record(z.enum(staticAbiTypes)).default({ key: "bytes32" } as const),
        valueSchema: z.record(z.enum(schemaAbiTypes)),
        // TODO: codegen
      })
    )
    .default({}),
  // TODO: codegen
});

type ConfigInput = z.input<typeof configSchema>;
type ConfigInputParsed = z.output<typeof configSchema>;

type TableInput = ConfigInputParsed["tables"][string];
type TableInputParsed = ConfigInputParsed["tables"][string];
type TableOutput<defaultNamespace extends string, tableName extends string, table extends TableInput> = table & {
  namespace: table["namespace"] extends string ? table["namespace"] : defaultNamespace;
  name: tableName;
  tableId: `0x${string}`;
};

type ConfigOutput<input extends ConfigInput, parsed extends ConfigInputParsed> = {
  tables: {
    [tableName in keyof NonNullable<input["tables"]> & string]: TableOutput<
      input["namespace"] extends string ? input["namespace"] : "",
      tableName,
      NonNullable<input["tables"]>[tableName]
    >;
  };
};

type ExpandedConfig<
  schema extends ZodTypeAny,
  input extends z.input<schema> = z.input<schema>,
  output extends z.output<schema> = z.output<schema>
> = {
  tables: {
    [tableName in keyof output["tables"] & string]: output["tables"][tableName] & {
      namespace: output["tables"][tableName]["namespace"] extends string
        ? output["tables"][tableName]["namespace"]
        : output["namespace"];
    };
  };
};

function transformTable<namespace extends string, tableName extends string, table extends TableInputParsed>(
  namespace: namespace,
  tableName: tableName,
  table: table
): TableOutput<namespace, tableName, table> {
  return {
    ...table,
    namespace,
    name: tableName,
    tableId: tableIdToHex(namespace, tableName),
  };
}

function storeConfig<TConfig extends ConfigInput>(config: TConfig): ConfigOutput<TConfig> {
  const parsedConfig = configSchema.parse(config);

  const tables = Object.fromEntries(
    Object.entries(parsedConfig.tables).map(([tableName, table]) => [
      tableName,
      transformTable(table.namespace ?? parsedConfig.namespace, tableName, table),
    ])
  ) as ConfigOutput<TConfig>["tables"];

  return {
    tables,
  };
}

const config = storeConfig({
  namespace: "hello",
  tables: {
    Position: {
      namespace: "overridden",
      keySchema: {
        x: "uint32",
        y: "uint32",
      },
      valueSchema: {
        entity: "bytes32",
      },
    },
    Entity: {
      valueSchema: {
        dead: "bool",
      },
    },
  },
} as const);

config.tables.Position.namespace;
//                      ^?
config.tables.Position.name;
//                      ^?
config.tables.Position.tableId;
//                      ^?
config.tables.Entity.keySchema;
//                      ^?
