import { Abi, Address, Hex } from "viem";
import IBaseWorldAbi from "../out/IBaseWorld.sol/IBaseWorld.abi.json" assert { type: "json" };
import { helloStoreEvent } from "@latticexyz/store";
import { helloWorldEvent } from "./worldEvents";

export const worldAbi = IBaseWorldAbi;

export const worldDeployEvents = [helloStoreEvent, helloWorldEvent] as const;

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
  readonly worldFunctions: readonly WorldFunction[];
};

export type DeployedSystem = Omit<System, "abi" | "prepareDeploy" | "deployedBytecodeSize" | "allowedSystemIds"> & {
  address: Address;
};
