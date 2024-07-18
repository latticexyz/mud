import { Store } from "@latticexyz/store";
import { DynamicResolution, ValueWithType } from "./dynamicResolution";
import { Hex } from "viem";

export type Module = {
  /**
   * The name of the module
   * @deprecated
   */
  readonly name: string;
  /** Should this module be installed as a root module? */
  readonly root: boolean;
  /** Arguments to be passed to the module's install method */
  readonly args: readonly (ValueWithType | DynamicResolution)[];
  /**
   * Import path to module's forge/solc JSON artifact with the module's compiled bytecode. This is used to create consistent, deterministic deploys for already-built modules
   * like those installed and imported from npm.
   *
   * This path is resolved using node's module resolution, so this supports both relative file paths (`../path/to/MyModule.json`) as well as JS import paths
   * (`@latticexyz/world-modules/out/CallWithSignatureModule.sol/CallWithSignatureModule.json`).
   *
   * If not provided, it's assumed that this is a local module as part of the project's source and the artifact will be looked up in forge's output directory.
   */
  readonly artifactPath: string | undefined;
};

export type System = {
  /**
   * Human-readable system label. Used as config keys, interface names, and filenames.
   * Labels are not length constrained like resource names, but special characters should be avoided to be compatible with the filesystem, Solidity compiler, etc.
   */
  readonly label: string;
  /**
   * System namespace used in system's resource ID and determines access control.
   */
  readonly namespace: string;
  /**
   * System name used in system's resource ID.
   */
  readonly name: string;
  /**
   * System's resource ID.
   */
  readonly systemId: Hex;
  /**
   * Register function selectors for the system in the World.
   * Defaults to true.
   * Note:
   * - For root systems all World function selectors will correspond to the system's function selectors.
   * - For non-root systems, the World function selectors will be <namespace>__<function>.
   */
  readonly registerFunctionSelectors: boolean;
  /** If openAccess is true, any address can call the system */
  readonly openAccess: boolean;
  /** An array of addresses or system names that can access the system */
  readonly accessList: readonly string[];
};

export type Systems = {
  readonly [label: string]: System;
};

export type Deploy = {
  /** The name of a custom World contract to deploy. If no name is provided, a default MUD World is deployed */
  readonly customWorldContract: string | undefined;
  /**
   * Script to execute after the deployment is complete (Default "PostDeploy").
   * Script must be placed in the forge scripts directory (see foundry.toml) and have a ".s.sol" extension.
   */
  readonly postDeployScript: string;
  /** Directory to write the deployment info to (Default "./deploys") */
  readonly deploysDirectory: string;
  /** JSON file to write to with chain -> latest world deploy address (Default "./worlds.json") */
  readonly worldsFile: string;
  /** Deploy the World as an upgradeable proxy */
  readonly upgradeableWorldImplementation: boolean;
};

export type Codegen = {
  /** The name of the World interface to generate. (Default `IWorld`) */
  readonly worldInterfaceName: string;
  /** Directory to output system and world interfaces of `worldgen` (Default "world") */
  readonly worldgenDirectory: string;
  /**
   * Path for world package imports. Default is "@latticexyz/world/src/"
   * @internal
   */
  readonly worldImportPath: string;
};

export type World = Store & {
  readonly systems: Systems;
  /** Systems to exclude from automatic deployment */
  readonly excludeSystems: readonly string[];
  /** Modules to in the World */
  readonly modules: readonly Module[];
  /** Deploy config */
  readonly deploy: Deploy;
  /** Codegen config */
  readonly codegen: Codegen;
};
