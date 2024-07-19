import { Store as StoreConfig } from "@latticexyz/store";
import { Tables } from "@latticexyz/config";
import { mergeRight } from "./mergeRight";
import storeConfig from "@latticexyz/store/mud.config";
import worldConfig from "@latticexyz/world/mud.config";
import { configToTables } from "./configToTables";
import { satisfy, show } from "@arktype/util";

type mudTables = mergeRight<configToTables<typeof storeConfig>, configToTables<typeof worldConfig>>;
const mudTables = {
  ...configToTables(storeConfig),
  ...configToTables(worldConfig),
};

// TODO: validate that extraTables keys correspond to table labels?
// TODO: move satisfy to type test
export type getAllTables<config extends StoreConfig, extraTables extends Tables> = satisfy<
  Tables,
  mergeRight<configToTables<config>, mergeRight<extraTables, mudTables>>
>;

export function getAllTables<config extends StoreConfig, extraTables extends Tables>(
  config: config,
  extraTables: extraTables,
): show<getAllTables<config, extraTables>> {
  return {
    ...configToTables(config),
    ...extraTables,
    ...mudTables,
  } as never;
}
