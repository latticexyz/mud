import { resourceToHex } from "@latticexyz/common";
import { KeySchema, ValueSchema } from "@latticexyz/protocol-parser";
import { SchemaAbiType, StaticAbiType } from "@latticexyz/schema-type";
import { StoreConfig, resolveUserTypes } from "@latticexyz/store";
import { Hex } from "viem";

// TODO: we shouldn't need this file once our config parsing returns nicely formed tables

type UserTypes<config extends StoreConfig = StoreConfig> = (config["userTypes"] extends Record<
  string,
  { readonly internalType: SchemaAbiType }
>
  ? {
      readonly [k in keyof config["userTypes"]]: config["userTypes"][k]["internalType"];
    }
  : Record<never, never>) &
  (config["enums"] extends Record<string, string[]>
    ? {
        readonly [k in keyof config["enums"]]: "uint8";
      }
    : Record<never, never>);

type ResolveValueSchema<config extends StoreConfig, valueSchema extends ValueSchema<UserTypes<config>>> = {
  readonly [k in keyof valueSchema & string]: config["userTypes"][k]["internalType"] extends SchemaAbiType
    ? config["userTypes"][k]["internalType"]
    : config["enums"][k] extends string[]
    ? "uint8"
    : valueSchema[k];
};

type ResolveKeySchema<config extends StoreConfig, keySchema extends KeySchema<UserTypes<config>>> = {
  readonly [k in keyof keySchema & string]: config["userTypes"][k]["internalType"] extends StaticAbiType
    ? config["userTypes"][k]["internalType"]
    : config["enums"][k] extends string[]
    ? "uint8"
    : keySchema[k];
};

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
  readonly keySchema: ResolveKeySchema<config, table["keySchema"]>;
  readonly valueSchema: ResolveValueSchema<config, table["valueSchema"]>;
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
