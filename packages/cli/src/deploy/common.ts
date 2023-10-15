import { Abi, Address, Hex, padHex } from "viem";
import storeConfig from "@latticexyz/store/mud.config.js";
import worldConfig from "@latticexyz/world/mud.config.js";
import { Tables, configToTables } from "./configToTables";
import { StoreConfig, helloStoreEvent } from "@latticexyz/store";
import { WorldConfig, helloWorldEvent } from "@latticexyz/world";

export const salt = padHex("0x", { size: 32 });

// TODO: add `as const` to mud config so these get more strongly typed (blocked by current config parsing not using readonly)
export const storeTables = configToTables(storeConfig);
export const worldTables = configToTables(worldConfig);

export const worldDeployEvents = [helloStoreEvent, helloWorldEvent] as const;

export type WorldDeploy = {
  readonly address: Address;
  readonly worldVersion: string;
  readonly storeVersion: string;
  /** Block number where the world was deployed */
  readonly deployBlock: bigint;
  /**
   * Block number at the time of fetching world deploy.
   * We use this block number when requesting data from the chain to align chain state
   * with the same block during the introspection steps of the deploy.
   */
  readonly stateBlock: bigint;
};

export type WorldFunction = {
  readonly signature: string;
  readonly selector: Hex;
  readonly systemId: Hex;
  readonly systemFunctionSignature: string;
  readonly systemFunctionSelector: Hex;
};

export type DeterministicContract = {
  readonly address: Address;
  readonly bytecode: Hex;
  readonly abi: Abi;
};

export type System = DeterministicContract & {
  readonly namespace: string;
  readonly name: string;
  readonly systemId: Hex;
  readonly allowAll: boolean;
  readonly allowedAddresses: readonly Hex[];
  readonly functions: readonly WorldFunction[];
};

export type Module = DeterministicContract & {
  readonly name: string;
  readonly installAsRoot: boolean;
  readonly installData: Hex; // TODO: figure out better naming for this
};

export type ConfigInput = StoreConfig & WorldConfig;
export type Config<config extends ConfigInput> = {
  readonly tables: Tables<config>;
  readonly systems: readonly System[];
  readonly modules: readonly Module[];
};

// Ideally, this should be an append-only list. Before adding more versions here, be sure to add backwards-compatible support for old Store/World versions.
export const supportedStoreVersions = ["1.0.0-unaudited"];
export const supportedWorldVersions = ["1.0.0-unaudited"];
