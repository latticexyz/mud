import { DynamicResolution } from "../dynamicResolution.js";

// zod doesn't preserve doc comments
export type SystemUserConfig =
  | {
      /** The full resource selector consists of namespace and name */
      name?: string;
      /**
       * Register function selectors for the system in the World.
       * Defaults to true.
       * Note:
       * - For root systems all World function selectors will correspond to the system's function selectors.
       * - For non-root systems, the World function selectors will be <namespace>_<system>_<function>.
       */
      registerFunctionSelectors?: boolean;
    } & (
      | {
          /** If openAccess is true, any address can call the system */
          openAccess: true;
        }
      | {
          /** If openAccess is false, only the addresses or systems in `access` can call the system */
          openAccess: false;
          /** An array of addresses or system names that can access the system */
          accessList: string[];
        }
    );

export type ValueWithType = {
  value: string | number | Uint8Array;
  type: string;
};

export type ModuleConfig = {
  /** The name of the module */
  name: string;
  /** Should this module be installed as a root module? */
  root?: boolean;
  /** Arguments to be passed to the module's install method */
  args?: (ValueWithType | DynamicResolution)[];
};

// zod doesn't preserve doc comments
export interface WorldUserConfig {
  /** The namespace to register tables and systems at. Defaults to the root namespace (empty string) */
  namespace?: string;
  /** The name of the World contract to deploy. If no name is provided, a vanilla World is deployed */
  worldContractName?: string;
  /** The name of the World interface to generate. (Default `IWorld`) */
  worldInterfaceName?: string;
  /**
   * Contracts named *System will be deployed by default
   * as public systems at `namespace/ContractName`, unless overridden
   *
   * The key is the system name (capitalized).
   * The value is a SystemConfig object.
   */
  overrideSystems?: Record<string, SystemUserConfig>;
  /** Systems to exclude from automatic deployment */
  excludeSystems?: string[];
  /**
   * Script to execute after the deployment is complete (Default "PostDeploy").
   * Script must be placed in the forge scripts directory (see foundry.toml) and have a ".s.sol" extension.
   */
  postDeployScript?: string;
  /** Directory to write the deployment info to (Default "./deploys") */
  deploysDirectory?: string;
  /** Directory to output system and world interfaces of `worldgen` (Default "world") */
  worldgenDirectory?: string;
  /** Path for world package imports. Default is "@latticexyz/world/src/" */
  worldImportPath?: string;
  /** Modules to in the World */
  modules?: ModuleConfig[];
}
