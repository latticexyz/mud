import { Hex, padHex } from "viem";
import storeConfig from "@latticexyz/store/mud.config.js";
import worldConfig from "@latticexyz/world/mud.config.js";
import IBaseWorldAbi from "@latticexyz/world/out/IBaseWorld.sol/IBaseWorld.abi.json" assert { type: "json" };
import { Tables, configToTables } from "./configToTables";
import { StoreConfig } from "@latticexyz/store";
import { WorldConfig } from "@latticexyz/world";

export const salt = padHex("0x", { size: 32 });

export const storeTables = configToTables(storeConfig);
export const worldTables = configToTables(worldConfig);

export const worldAbi = IBaseWorldAbi;

export type System = {
  bytecode: Hex;
  namespace: string;
  name: string;
  label: string;
  systemId: Hex;
  allowAll: boolean;
  allowedAddresses: Hex[];
  allowedSystemIds: string[];
};

export type ConfigInput = StoreConfig & WorldConfig;
export type Config<config extends ConfigInput> = {
  tables: Tables<config>;
  systems: Record<string, System>;
};
