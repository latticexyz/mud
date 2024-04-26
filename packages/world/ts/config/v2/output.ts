import { Store } from "@latticexyz/store";
import { DynamicResolution, ValueWithType } from "./dynamicResolution";

export type Module = {
  /** The name of the module */
  readonly name: string;
  /** Should this module be installed as a root module? */
  readonly root?: boolean;
  /** Arguments to be passed to the module's install method */
  readonly args?: (ValueWithType | DynamicResolution)[];
};

export type System = {
  /** The name of the system contract. Becomes part of the `systemId`. */
  readonly name: string;
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
  readonly accessList: string[];
};

export type Systems = { readonly [key: string]: System };

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
  /** Path for world package imports. Default is "@latticexyz/world/src/" */
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
