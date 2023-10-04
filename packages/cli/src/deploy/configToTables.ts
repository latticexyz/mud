import { resourceIdToHex } from "@latticexyz/common";
import { KeySchema, ValueSchema } from "@latticexyz/protocol-parser";
import { StoreConfig } from "@latticexyz/store";
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
  label: `${config["namespace"]}:${table["name"]}`;
  tableId: Hex;
  keySchema: table["keySchema"] & KeySchema;
  valueSchema: table["valueSchema"] & ValueSchema;
};

export type Tables<config extends StoreConfig = StoreConfig> = {
  [k in keyof config["tables"] as TableKey<config, config["tables"][k]>]: Table<config, config["tables"][k]>;
};

export function configToTables<config extends StoreConfig>(config: config): Tables<config> {
  return Object.fromEntries(
    Object.values(config.tables).map((table) => [
      `${config.namespace}_${table.name}` satisfies TableKey<config, config["tables"][keyof config["tables"]]>,
      {
        namespace: config.namespace,
        name: table.name,
        label: `${config.namespace}:${table.name}`,
        tableId: resourceIdToHex({
          type: table.offchainOnly ? "offchainTable" : "table",
          namespace: config.namespace,
          name: table.name,
        }),
        keySchema: table.keySchema as KeySchema,
        valueSchema: table.valueSchema as ValueSchema,
      } satisfies Table<config, config["tables"][keyof config["tables"]]>,
    ])
  ) as Tables<config>;
}
