import { Abi, Account, Address, Chain, Client, Hex, Transport } from "viem";
import IBaseWorldAbi from "@latticexyz/world/out/IBaseWorld.sol/IBaseWorld.abi.json" with { type: "json" };
import { helloStoreEvent } from "@latticexyz/store";
import { helloWorldEvent } from "@latticexyz/world";
import { LibraryMap } from "./getLibraryMap";

export const worldDeployEvents = [helloStoreEvent, helloWorldEvent] as const;

export const worldAbi = IBaseWorldAbi;

// Ideally, this should be an append-only list. Before adding more versions here, be sure to add backwards-compatible support for old Store/World versions.
export const supportedStoreVersions = ["2.0.0", "2.0.1", "2.0.2"];
export const supportedWorldVersions = ["2.0.0", "2.0.1", "2.0.2"];

// TODO: extend this to include factory+deployer address? so we can reuse the deployer for a world?
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

export type LibraryPlaceholder = {
  /**
   * Path to library source file, e.g. `src/libraries/SomeLib.sol`
   */
  path: string;
  /**
   * Library name, e.g. `SomeLib`
   */
  name: string;
  /**
   * Byte offset of placeholder in bytecode
   */
  start: number;
  /**
   * Size of placeholder to replace in bytes
   */
  length: number;
};

export type DeterministicContract = {
  readonly prepareDeploy: (
    deployer: Address,
    libraryMap?: LibraryMap,
  ) => {
    readonly address: Address;
    readonly bytecode: Hex;
  };
  readonly deployedBytecodeSize: number;
  readonly abi: Abi;
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

export type System = DeterministicContract & {
  // labels
  readonly label: string;
  readonly namespaceLabel: string;
  // resource ID
  readonly namespace: string;
  readonly name: string;
  readonly systemId: Hex;
  // access
  readonly allowAll: boolean;
  readonly allowedAddresses: readonly Hex[];
  readonly allowedSystemIds: readonly Hex[];
  // world registration
  // TODO: replace this with system manifest data
  readonly worldFunctions: readonly WorldFunction[];
  // metadata to register onchain
  readonly metadata: {
    // human readable ABIs
    readonly abi: readonly string[];
    readonly worldAbi: readonly string[];
  };
};

export type DeployedSystem = Omit<
  System,
  "label" | "namespaceLabel" | "abi" | "metadata" | "prepareDeploy" | "deployedBytecodeSize" | "allowedSystemIds"
> & {
  address: Address;
};

export type Module = DeterministicContract & {
  readonly name: string;
  readonly installStrategy: "root" | "delegation" | "default";
  readonly installData: Hex; // TODO: figure out better naming for this
  /**
   * @internal
   * Optional modules warn instead of throw if they revert while being installed.
   */
  readonly optional?: boolean;
};

export type CommonDeployOptions = {
  readonly client: Client<Transport, Chain | undefined, Account>;
  readonly worldDeploy: WorldDeploy;
  readonly indexerUrl?: string;
  readonly chainId?: number;
};
