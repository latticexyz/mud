import { evaluate } from "@arktype/util";
import { StoreInput, StoreWithShorthandsInput } from "@latticexyz/store/config/v2";
import { Module } from "./output";
import { DynamicResolution, ValueWithType } from "./dynamicResolution";

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
  accessList?: readonly string[];
};

export type SystemsInput = { [key: string]: SystemInput };

export type ModuleInput = {
  /** The name of the module */
  readonly name: string;
  /** Should this module be installed as a root module? */
  readonly root?: boolean;
  /** Arguments to be passed to the module's install method */
  // TODO: make more strongly typed by taking in tables input
  readonly args?: readonly (ValueWithType | DynamicResolution)[];
  /**
   * Import path to module's forge/solc JSON artifact with the module's compiled bytecode. This is used to create consistent, deterministic deploys for already-built modules
   * like those installed and imported from npm.
   *
   * This path is resolved using node's module resolution, so this supports both relative file paths (`../path/to/MyModule.json`) as well as JS import paths
   * (`@latticexyz/world-modules/out/CallWithSignatureModule.sol/CallWithSignatureModule.json`).
   *
   * If not provided, it's assumed that this is a local module as part of the project's source and the artifact will be looked up in forge's output directory.
   */
  readonly artifactPath?: string;
};

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
    excludeSystems?: readonly string[];
    /** Modules to in the World */
    modules?: readonly Module[];
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
