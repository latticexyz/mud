import { SchemaAbiType, StaticAbiType } from "@latticexyz/schema-type";
import { ExpandTablesConfig, StoreConfig, StoreUserConfig, resolveUserTypes } from "./storeConfig";
import { Hex } from "viem";
import { resourceToHex } from "@latticexyz/common";

// export type ConfigToResolvedTables<
//   config extends StoreUserConfig,
//   tables extends ExpandTablesConfig<config["tables"]>
// > = {
//   [tableName in keyof tables]: {
//     tableId: Hex;
//     namespace: config["namespace"];
//     name: tableName;
//     keySchema: tables[tableName]["keySchema"];
//     valueSchema: tables[tableName]["valueSchema"];
//   };
// };

// TODO: helper to filter user types to StaticAbiType
export type UserTypes = Record<string, { internalType: SchemaAbiType }>;

export type KeySchema<userTypes extends UserTypes | undefined = undefined> = Record<
  string,
  userTypes extends UserTypes ? StaticAbiType | keyof userTypes : StaticAbiType
>;
export type ValueSchema<userTypes extends UserTypes | undefined = undefined> = Record<
  string,
  userTypes extends UserTypes ? SchemaAbiType | keyof userTypes : SchemaAbiType
>;

type ConfigToUserTypes<config extends StoreConfig = StoreConfig> = config["userTypes"];
// TODO: fix strong enum types and avoid every schema getting `{ [k: string]: "uint8" }`
// type ConfigToUserTypes<config extends StoreConfig = StoreConfig> = config["userTypes"] & {
//   [k in keyof config["enums"]]: { internalType: "uint8" };
// };

export type TableKey<
  config extends StoreConfig = StoreConfig,
  table extends config["tables"][keyof config["tables"]] = config["tables"][keyof config["tables"]]
> = `${config["namespace"]}_${table["name"]}`;

export type Table<
  config extends StoreConfig = StoreConfig,
  table extends config["tables"][keyof config["tables"]] = config["tables"][keyof config["tables"]]
> = {
  readonly namespace: config["namespace"];
  readonly name: table["name"];
  readonly tableId: Hex;
  readonly keySchema: table["keySchema"] extends KeySchema<ConfigToUserTypes<config>>
    ? KeySchema & {
        readonly [k in keyof table["keySchema"]]: ConfigToUserTypes<config>[table["keySchema"][k]]["internalType"] extends StaticAbiType
          ? ConfigToUserTypes<config>[table["keySchema"][k]]["internalType"]
          : table["keySchema"][k];
      }
    : KeySchema;
  readonly valueSchema: table["valueSchema"] extends ValueSchema<ConfigToUserTypes<config>>
    ? {
        readonly [k in keyof table["valueSchema"]]: ConfigToUserTypes<config>[table["valueSchema"][k]]["internalType"] extends SchemaAbiType
          ? ConfigToUserTypes<config>[table["valueSchema"][k]]["internalType"]
          : table["valueSchema"][k];
      }
    : ValueSchema;
};

export type Tables<config extends StoreConfig = StoreConfig> = {
  readonly [k in keyof config["tables"] as TableKey<config, config["tables"][k]>]: Table<config, config["tables"][k]>;
};

export function configToTables<config extends StoreConfig>(config: config): Tables<config> {
  const userTypes = {
    ...config.userTypes,
    ...Object.fromEntries(Object.entries(config.enums).map(([key]) => [key, { internalType: "uint8" }] as const)),
  };
  return Object.fromEntries(
    Object.entries(config.tables).map(([tableName, table]) => [
      `${config.namespace}_${tableName}` satisfies TableKey<config, config["tables"][keyof config["tables"]]>,
      {
        namespace: config.namespace,
        name: table.name,
        tableId: resourceToHex({
          type: table.offchainOnly ? "offchainTable" : "table",
          namespace: config.namespace,
          name: table.name,
        }),
        keySchema: resolveUserTypes(table.keySchema, userTypes) as any,
        valueSchema: resolveUserTypes(table.valueSchema, userTypes) as any,
      } satisfies Table<config, config["tables"][keyof config["tables"]]>,
    ])
  ) as Tables<config>;
}
