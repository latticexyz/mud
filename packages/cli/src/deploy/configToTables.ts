import { resourceToHex } from "@latticexyz/common";
import { KeySchema, ValueSchema } from "@latticexyz/protocol-parser";
import { SchemaAbiType, StaticAbiType } from "@latticexyz/schema-type";
import { StoreConfig, resolveUserTypes } from "@latticexyz/store";
import { Hex } from "viem";

// TODO: we shouldn't need this file once our config parsing returns nicely formed tables

type UserTypes<config extends StoreConfig = StoreConfig> = config["userTypes"];
// TODO: fix strong enum types and avoid every schema getting `{ [k: string]: "uint8" }`
// type UserTypes<config extends StoreConfig = StoreConfig> = config["userTypes"] & {
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
  readonly keySchema: table["keySchema"] extends KeySchema<UserTypes<config>>
    ? KeySchema & {
        readonly [k in keyof table["keySchema"]]: UserTypes<config>[table["keySchema"][k]]["internalType"] extends StaticAbiType
          ? UserTypes<config>[table["keySchema"][k]]["internalType"]
          : table["keySchema"][k];
      }
    : KeySchema;
  readonly valueSchema: table["valueSchema"] extends ValueSchema<UserTypes<config>>
    ? {
        readonly [k in keyof table["valueSchema"]]: UserTypes<config>[table["valueSchema"][k]]["internalType"] extends SchemaAbiType
          ? UserTypes<config>[table["valueSchema"][k]]["internalType"]
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
