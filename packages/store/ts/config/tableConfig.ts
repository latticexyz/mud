import { tableIdToHex } from "@latticexyz/common";
import { assertExhaustive } from "@latticexyz/common/utils";
import { SchemaAbiType, StaticAbiType, isSchemaAbiType } from "@latticexyz/schema-type";

// TODO: combine with protocol-parser def and move up to schema-type?
export type KeySchema = Readonly<Record<string, StaticAbiType>>;
export type ValueSchema = Readonly<Record<string, SchemaAbiType>>;

export type TableType = "table" | "offchainTable";

// export type TableConfig = Readonly<{
//   type: TableType;
//   namespace: string;
//   name: string;
//   tableId: `0x${string}`;
//   keySchema: KeySchema;
//   valueSchema: ValueSchema;
//   codegen: {
//     outputDirectory: string;
//     tableIdArgument: boolean;
//     storeArgument: boolean;
//     dataStruct: boolean;
//   };
// }>;

type TableInput = SchemaAbiType | TableInputShape;
type TableInputShape = Readonly<{
  namespace?: string;
  keySchema?: KeySchema;
  valueSchema: SchemaAbiType | ValueSchema;
  offchainOnly?: boolean;
}>;

type ConfigInput = Readonly<{
  namespace?: string;
  tables?: Record<string, TableInput>;
}>;

const defaultKeySchema = { key: "bytes32" } as const;

type TableOutput<
  defaultNamespace extends string,
  tableName extends string,
  input extends TableInput
> = input extends SchemaAbiType
  ? // TODO: some shared output type so we can ensure each branch of the conditional are complete
    Readonly<{
      type: "table";
      namespace: defaultNamespace;
      name: tableName;
      tableId: `0x${string}`;
      keySchema: typeof defaultKeySchema;
      valueSchema: Readonly<{ value: input }>;
    }>
  : input extends TableInputShape
  ? Readonly<{
      type: input["offchainOnly"] extends true ? "offchainTable" : "table";
      namespace: input["namespace"] extends string ? input["namespace"] : defaultNamespace;
      name: tableName;
      tableId: `0x${string}`;
      keySchema: input["keySchema"] extends KeySchema
        ? input["keySchema"]
        : input["keySchema"] extends undefined
        ? typeof defaultKeySchema
        : never;
      valueSchema: input["valueSchema"] extends ValueSchema
        ? input["valueSchema"]
        : input["valueSchema"] extends SchemaAbiType
        ? Readonly<{ value: input["valueSchema"] }>
        : never;
    }>
  : never;

type ConfigOutput<input extends ConfigInput> = {
  tables: Readonly<{
    [tableName in keyof NonNullable<input["tables"]> & string]: TableOutput<
      input["namespace"] extends string ? input["namespace"] : "",
      tableName,
      NonNullable<input["tables"]>[tableName]
    >;
  }>;
};

function isTable(table: SchemaAbiType | TableInputShape): table is TableInputShape {
  return !isSchemaAbiType(table);
}

function parseTableInput<defaultNamespace extends string, name extends string, input extends TableInput>(
  defaultNamespace: defaultNamespace,
  name: name,
  input: input
): TableOutput<defaultNamespace, name, input> {
  if (isSchemaAbiType(input)) {
    // TODO: figure out how to do this without casting
    //       or at least so casting does some enforcement of the object
    return {
      namespace: defaultNamespace,
      name,
      tableId: tableIdToHex(defaultNamespace, name),
      keySchema: defaultKeySchema,
      valueSchema: { value: input },
    } as TableOutput<defaultNamespace, name, input>;
  }

  if (isTable(input)) {
    // TODO: figure out how to do this without casting
    //       or at least so casting does some enforcement of the object
    return {
      ...(input as TableInputShape),
      namespace: input.namespace ?? defaultNamespace,
      name,
      tableId: tableIdToHex(input.namespace ?? defaultNamespace, name),
    } as TableOutput<defaultNamespace, name, input>;
  }

  assertExhaustive(input);
}

function storeConfig<input extends ConfigInput>(input: input): ConfigOutput<input> {
  const namespace = input.namespace ?? "";
  const tables = Object.fromEntries(
    Object.entries(input.tables ?? {}).map(([tableName, table]) => [
      tableName,
      parseTableInput(namespace, tableName, table),
    ])
  ) as ConfigOutput<input>["tables"];

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
    SimpleSchema: {
      valueSchema: "bytes32",
    },
    JustValue: "uint256",
  },
} as const);

config.tables.Position.namespace;
//                      ^?
config.tables.Position.name;
//                      ^?
config.tables.Position.tableId;
//                      ^?
config.tables.Entity.namespace;
//                      ^?
config.tables.Entity.keySchema;
//                      ^?
config.tables.Entity.valueSchema;
//                      ^?
config.tables.SimpleSchema.valueSchema;
//                           ^?
config.tables.JustValue.keySchema;
//                       ^?
config.tables.JustValue.valueSchema;
//                       ^?
