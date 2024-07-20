import { Store as StoreConfig } from "@latticexyz/store";
import { Tables } from "@latticexyz/config";
import storeConfig from "@latticexyz/store/mud.config";
import worldConfig from "@latticexyz/world/mud.config";
import { configToTables } from "./configToTables";
import { merge, show } from "@arktype/util";

type mudTables = merge<configToTables<typeof storeConfig>, configToTables<typeof worldConfig>>;
const mudTables = {
  ...configToTables(storeConfig),
  ...configToTables(worldConfig),
};

// TODO: validate that extraTables keys correspond to table labels?
export type getAllTables<config extends StoreConfig, extraTables extends Tables> = merge<
  configToTables<config>,
  merge<extraTables, mudTables>
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
