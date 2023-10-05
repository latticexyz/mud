import { resourceToHex } from "@latticexyz/common";
import storeConfig from "@latticexyz/store/mud.config";
import worldConfig from "@latticexyz/world/mud.config";

// TODO: refactor config to include table IDs (https://github.com/latticexyz/mud/pull/1561)

export const storeTableIds = Object.keys(storeConfig.tables).map((name) =>
  resourceToHex({
    type: storeConfig.tables[name as keyof typeof storeConfig.tables].offchainOnly ? "offchainTable" : "table",
    namespace: storeConfig.namespace,
    name,
  })
);

const worldTableIds = Object.keys(worldConfig.tables).map((name) =>
  resourceToHex({
    type: worldConfig.tables[name as keyof typeof worldConfig.tables].offchainOnly ? "offchainTable" : "table",
    namespace: worldConfig.namespace,
    name,
  })
);

export const internalTableIds = [...storeTableIds, ...worldTableIds];
