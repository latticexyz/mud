import { Abi, Address, Hex } from "viem";
import IBaseWorldAbi from "../out/IBaseWorld.sol/IBaseWorld.abi.json" assert { type: "json" };
import { helloStoreEvent } from "@latticexyz/store";
import { helloWorldEvent } from "./worldEvents";

export const worldAbi = IBaseWorldAbi;

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

export type Library = DeterministicContract & {
  /**
   * Path to library source file, e.g. `src/libraries/SomeLib.sol`
   */
  path: string;
  /**
   * Library name, e.g. `SomeLib`
   */
  name: string;
};

export type DeterministicContract = {
  readonly prepareDeploy: (
    deployer: Address,
    libraries: readonly Library[],
  ) => {
    readonly address: Address;
    readonly bytecode: Hex;
  };
  readonly deployedBytecodeSize: number;
  readonly abi: Abi;
};

export type WorldFunction = {
  readonly signature: string;
  readonly selector: Hex;
  readonly systemId: Hex;
  readonly systemFunctionSignature: string;
  readonly systemFunctionSelector: Hex;
};

export type System = DeterministicContract & {
  // TODO: add label
  readonly namespace: string;
  readonly name: string;
  readonly systemId: Hex;
  readonly allowAll: boolean;
  readonly allowedAddresses: readonly Hex[];
  readonly allowedSystemIds: readonly Hex[];
  readonly functions: readonly WorldFunction[];
};

export type DeployedSystem = Omit<System, "abi" | "prepareDeploy" | "deployedBytecodeSize" | "allowedSystemIds"> & {
  address: Address;
};
