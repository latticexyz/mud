import { resourceToHex } from "@latticexyz/common";
import { KeySchema, ValueSchema } from "@latticexyz/protocol-parser";
import { SchemaAbiType, StaticAbiType } from "@latticexyz/schema-type";
import { StoreConfig, resolveUserTypes } from "@latticexyz/store";
import { Hex } from "viem";

// TODO: we shouldn't need this file once our config parsing returns nicely formed tables

export type TableKey<
  config extends StoreConfig = StoreConfig,
  table extends config["tables"][keyof config["tables"]] = config["tables"][keyof config["tables"]]
> = `${config["namespace"]}_${table["name"]}`;

export type Table<
  config extends StoreConfig = StoreConfig,
  table extends config["tables"][keyof config["tables"]] = config["tables"][keyof config["tables"]]
> = {
  namespace: config["namespace"];
  name: table["name"];
  tableId: Hex;
  // TODO: support enums
  keySchema: table["keySchema"] extends KeySchema<config["userTypes"]>
    ? KeySchema & {
        [k in keyof table["keySchema"]]: config["userTypes"][table["keySchema"][k]]["internalType"] extends StaticAbiType
          ? config["userTypes"][table["keySchema"][k]]["internalType"]
          : table["keySchema"][k];
      }
    : KeySchema;
  // TODO: support enums
  valueSchema: table["valueSchema"] extends ValueSchema<config["userTypes"]>
    ? {
        [k in keyof table["valueSchema"]]: config["userTypes"][table["valueSchema"][k]]["internalType"] extends SchemaAbiType
          ? config["userTypes"][table["valueSchema"][k]]["internalType"]
          : table["valueSchema"][k];
      }
    : ValueSchema;
};

export type Tables<config extends StoreConfig = StoreConfig> = {
  [k in keyof config["tables"] as TableKey<config, config["tables"][k]>]: Table<config, config["tables"][k]>;
};

export function configToTables<config extends StoreConfig>(config: config): Tables<config> {
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
        keySchema: resolveUserTypes(table.keySchema, config.userTypes) as any,
        valueSchema: resolveUserTypes(table.valueSchema, config.userTypes) as any,
      } satisfies Table<config, config["tables"][keyof config["tables"]]>,
    ])
  ) as Tables<config>;
}
