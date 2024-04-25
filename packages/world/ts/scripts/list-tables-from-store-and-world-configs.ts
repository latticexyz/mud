import { type Hex } from "viem";

import { type ExpandMUDUserConfig } from "@latticexyz/store/register";
import { type MUDCoreUserConfig } from "@latticexyz/config";

import { resourceToHex } from "@latticexyz/common";

import storeConfig from "@latticexyz/store/mud.config";
import worldConfig from "../../mud.config";

function configToTables<T extends MUDCoreUserConfig>(config: ExpandMUDUserConfig<T>): { name: string; id: Hex }[] {
  return Object.entries(config.tables)
    .filter(([_, table]) => !table.tableIdArgument) // Skip generic tables
    .map(([name, table]) => ({
      name: name,
      id: resourceToHex({
        type: table.offchainOnly ? "offchainTable" : "table",
        namespace: config.namespace,
        name: table.name,
      }),
    }));
}

console.log(JSON.stringify([...configToTables(storeConfig), ...configToTables(worldConfig)]));
