import { World as RecsWorld } from "@latticexyz/recs";
import { mudTables } from "../common";
import { tablesToComponents } from "./tablesToComponents";
import { Store as StoreConfig } from "@latticexyz/store";
import { merge } from "@ark/util";
import { configToTables } from "../configToTables";
import { defineInternalComponents } from "./defineInternalComponents";
import { Tables } from "@latticexyz/config";

export type registerComponents<config extends StoreConfig, extraTables extends Tables = {}> = merge<
  merge<
    merge<tablesToComponents<configToTables<config>>, tablesToComponents<extraTables>>,
    tablesToComponents<mudTables>
  >,
  ReturnType<typeof defineInternalComponents>
>;

export function registerComponents<const config extends StoreConfig, const extraTables extends Tables = {}>({
  world,
  config,
  extraTables = {} as extraTables,
}: {
  world: RecsWorld;
  config: config;
  extraTables?: extraTables;
}): registerComponents<config, extraTables> {
  return {
    ...tablesToComponents(world, configToTables(config) as configToTables<config>),
    ...tablesToComponents(world, extraTables),
    ...tablesToComponents(world, mudTables),
    ...defineInternalComponents(world),
  } as never;
}
