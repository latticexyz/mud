import { Store as StoreConfig } from "@latticexyz/store";
import { Tables } from "@latticexyz/config";
import { tablesByLabel } from "./tablesByLabel";
import { mergeRight } from "./mergeRight";
import storeConfig from "@latticexyz/store/mud.config";
import worldConfig from "@latticexyz/world/mud.config";

const storeTables = storeConfig.tables;
type storeTables = typeof storeTables;

const worldTables = worldConfig.tables;
type worldTables = typeof worldTables;

export type getAllTables<config extends StoreConfig, extraTables extends Tables> = tablesByLabel<
  mergeRight<config["tables"], mergeRight<extraTables, mergeRight<storeTables, worldTables>>>
>;

export function getAllTables<config extends StoreConfig, extraTables extends Tables>(
  config: config,
  extraTables: extraTables,
): getAllTables<config, extraTables> {
  return tablesByLabel({
    ...config.tables,
    ...extraTables,
    ...storeTables,
    ...worldTables,
  }) as never;
}
