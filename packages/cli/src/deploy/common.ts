import { Abi, Address, Hex, padHex } from "viem";
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

// TODO: add tests that these stay in sync with WorldFactory and IBaseWorld ABIs
// TODO: move these to world package?
export const worldDeployedEvent = "event WorldDeployed(address indexed newContract)";
export const helloWorldEvent = "event HelloWorld(bytes32 indexed worldVersion)";
export const helloStoreEvent = "event HelloStore(bytes32 indexed storeVersion)";

export type WorldDeploy = {
  address: Address;
  worldVersion: string;
  storeVersion: string;
  /** Block number where the world was deployed */
  fromBlock: bigint;
  /** Block number at the time of fetching world deploy, to keep further queries aligned to the same block number */
  toBlock: bigint;
};

export type WorldFunction = {
  signature: string;
  selector: Hex;
  systemId: Hex;
  systemFunctionSignature: string;
  systemFunctionSelector: Hex;
};

export type System = {
  address: Address;
  namespace: string;
  name: string;
  systemId: Hex;
  allowAll: boolean;
  allowedAddresses: Hex[];
  allowedSystemIds: string[];
  bytecode: Hex;
  abi: Abi;
  functions: WorldFunction[];
};

export type ConfigInput = StoreConfig & WorldConfig;
export type Config<config extends ConfigInput> = {
  tables: Tables<config>;
  systems: Record<string, System>;
};
