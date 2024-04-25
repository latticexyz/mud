import { evaluate } from "@arktype/util";
import { StoreInput, StoreWithShorthandsInput } from "@latticexyz/store/config/v2";
import { Module } from "./output";

export type SystemInput = {
  /** The full resource selector consists of namespace and name */
  name?: string;
  /**
   * Register function selectors for the system in the World.
   * Defaults to true.
   * Note:
   * - For root systems all World function selectors will correspond to the system's function selectors.
   * - For non-root systems, the World function selectors will be <namespace>__<function>.
   */
  registerFunctionSelectors?: boolean;
  /** If openAccess is true, any address can call the system */
  openAccess?: boolean;
  /** An array of addresses or system names that can access the system */
  accessList?: string[];
};

export type SystemsInput = { [key: string]: SystemInput };

export type DeployInput = {
  /**
   * Script to execute after the deployment is complete (Default "PostDeploy").
   * Script must be placed in the forge scripts directory (see foundry.toml) and have a ".s.sol" extension.
   */
  postDeployScript?: string;
  /** Directory to write the deployment info to (Default "./deploys") */
  deploysDirectory?: string;
  /** JSON file to write to with chain -> latest world deploy address (Default "./worlds.json") */
  worldsFile?: string;
  /** Deploy the World as an upgradeable proxy */
  upgradeableWorldImplementation?: boolean;
};

export type CodegenInput = {
  /** The name of the World interface to generate. (Default `IWorld`) */
  worldInterfaceName?: string;
  /** Directory to output system and world interfaces of `worldgen` (Default "world") */
  worldgenDirectory?: string;
  /** Path for world package imports. Default is "@latticexyz/world/src/" */
  worldImportPath?: string;
};

export type WorldInput = evaluate<
  StoreInput & {
    namespaces?: NamespacesInput;
    /**
     * Contracts named *System will be deployed by default
     * as public systems at `namespace/ContractName`, unless overridden
     *
     * The key is the system name (capitalized).
     * The value is a SystemConfig object.
     */
    systems?: SystemsInput;
    /** System names to exclude from automatic deployment */
    excludeSystems?: string[];
    /** Modules to in the World */
    modules?: Module[];
    /** Deploy config */
    deploy?: DeployInput;
    /** Codegen config */
    codegen?: CodegenInput;
  }
>;

export type NamespacesInput = { [key: string]: NamespaceInput };

export type NamespaceInput = Pick<StoreInput, "tables">;

/******** Variations with shorthands ********/

export type WorldWithShorthandsInput = Omit<WorldInput, "tables"> & Pick<StoreWithShorthandsInput, "tables">;
