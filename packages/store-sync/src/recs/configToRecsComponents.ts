import { StoreConfig, resolveUserTypes } from "@latticexyz/store";
import { resourceToHex } from "@latticexyz/common";
import { World } from "@latticexyz/recs";
import { ConfigToRecsComponents } from "./common";
import { tableToRecsComponent } from "./tableToRecsComponent";
import { KeySchema } from "@latticexyz/protocol-parser";

export function configToRecsComponents<TConfig extends StoreConfig>(
  world: World,
  config: TConfig
): ConfigToRecsComponents<TConfig> {
  const userTypes = {
    ...config.userTypes,
    ...Object.fromEntries(Object.entries(config.enums).map(([key]) => [key, { internalType: "uint8" }] as const)),
  };

  return Object.fromEntries(
    Object.entries(config.tables).map(([tableName, table]) => [
      tableName,
      tableToRecsComponent(world, {
        tableId: resourceToHex({
          type: table.offchainOnly ? "offchainTable" : "table",
          namespace: config.namespace,
          name: table.name, // using the parsed config's `table.name` here rather than `tableName` key because that's what's used by codegen
        }),
        namespace: config.namespace,
        name: tableName,
        // TODO: refine to static ABI types so we don't have to cast
        keySchema: resolveUserTypes(table.keySchema, userTypes) as KeySchema,
        valueSchema: resolveUserTypes(table.valueSchema, userTypes),
      }),
    ])
  ) as ConfigToRecsComponents<TConfig>;
}
