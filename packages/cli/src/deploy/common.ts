import { Abi, Address, Hex, padHex } from "viem";
import storeConfig from "@latticexyz/store/mud.config.js";
import worldConfig from "@latticexyz/world/mud.config.js";
import IBaseWorldAbi from "@latticexyz/world/out/IBaseWorld.sol/IBaseWorld.abi.json" assert { type: "json" };
import { Tables, configToTables } from "./configToTables";
import { StoreConfig } from "@latticexyz/store";
import { WorldConfig } from "@latticexyz/world";

export const salt = padHex("0x", { size: 32 });

// TODO: add `as const` to mud config so these get more strongly typed (blocked by current config parsing not using readonly)
export const storeTables = configToTables(storeConfig);
export const worldTables = configToTables(worldConfig);

export const worldAbi = IBaseWorldAbi;

// TODO: add tests that these stay in sync with WorldFactory and IBaseWorld ABIs
// TODO: move these to world package?
export const worldDeployedEvent = "event WorldDeployed(address indexed newContract)";
export const helloWorldEvent = "event HelloWorld(bytes32 indexed worldVersion)";
export const helloStoreEvent = "event HelloStore(bytes32 indexed storeVersion)";

export type WorldDeploy = {
  readonly address: Address;
  readonly worldVersion: string;
  readonly storeVersion: string;
  /** Block number where the world was deployed */
  readonly fromBlock: bigint;
  /** Block number at the time of fetching world deploy, to keep further queries aligned to the same block number */
  readonly toBlock: bigint;
};

export type WorldFunction = {
  readonly signature: string;
  readonly selector: Hex;
  readonly systemId: Hex;
  readonly systemFunctionSignature: string;
  readonly systemFunctionSelector: Hex;
};

export type System = {
  readonly namespace: string;
  readonly name: string;
  readonly systemId: Hex;
  readonly allowAll: boolean;
  readonly allowedAddresses: readonly Hex[];
  readonly address: Address;
  readonly bytecode: Hex;
  readonly abi: Abi;
  readonly functions: readonly WorldFunction[];
};

export type Module = {
  readonly name: string;
  readonly installAsRoot: boolean;
  readonly installData: Hex; // TODO: figure out better naming for this
  readonly address: Address;
  readonly bytecode: Hex;
  readonly abi: Abi;
};

export type ConfigInput = StoreConfig & WorldConfig;
export type Config<config extends ConfigInput> = {
  readonly tables: Tables<config>;
  readonly systems: readonly System[];
  readonly modules: readonly Module[];
};
