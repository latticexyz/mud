import { evaluate } from "@arktype/util";
import { UserTypes, Enums, StoreConfigInput } from "@latticexyz/store/config/v2";
import { DynamicResolution, ValueWithType } from "./dynamicResolution";

export type ModuleConfig = {
  /** The name of the module */
  name: string;
  /** Should this module be installed as a root module? */
  root?: boolean;
  /** Arguments to be passed to the module's install method */
  args?: (ValueWithType | DynamicResolution)[];
};

export type SystemConfigInput = {
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
} & (
  | {
      /** If openAccess is true, any address can call the system */
      openAccess?: true;
    }
  | {
      /** If openAccess is false, only the addresses or systems in `access` can call the system */
      openAccess: false;
      /** An array of addresses or system names that can access the system */
      accessList: string[];
    }
);

export type SystemsConfigInput = { [key: string]: SystemConfigInput };

export type DeploymentConfigInput = {
  /** The name of the World contract to deploy. If no name is provided, a vanilla World is deployed */
  worldContractName?: string;
  /**
   * Script to execute after the deployment is complete (Default "PostDeploy").
   * Script must be placed in the forge scripts directory (see foundry.toml) and have a ".s.sol" extension.
   */
  postDeployScript?: string;
  /** Directory to write the deployment info to (Default "./deploys") */
  deploysDirectory?: string;
  /** JSON file to write to with chain -> latest world deploy address (Default "./worlds.json") */
  worldsFile?: string;
};

export type CodegenConfigInput = {
  /** The name of the World interface to generate. (Default `IWorld`) */
  worldInterfaceName?: string;
  /** Directory to output system and world interfaces of `worldgen` (Default "world") */
  worldgenDirectory?: string;
  /** Path for world package imports. Default is "@latticexyz/world/src/" */
  worldImportPath?: string;
};

export type WorldConfigInput<userTypes extends UserTypes = UserTypes, enums extends Enums = Enums> = evaluate<
  StoreConfigInput<userTypes, enums> & {
    namespaces?: NamespacesInput;
    /**
     * Contracts named *System will be deployed by default
     * as public systems at `namespace/ContractName`, unless overridden
     *
     * The key is the system name (capitalized).
     * The value is a SystemConfig object.
     */
    systems?: SystemConfigInput;
    /** Systems to exclude from automatic deployment */
    excludeSystems?: string[];
    /** Modules to in the World */
    modules?: ModuleConfig[];
    /** Deployment config */
    deployment?: DeploymentConfigInput;
    /** Codegen config */
    codegen?: CodegenConfigInput;
  }
>;

export type NamespacesInput = { [key: string]: NamespaceInput };

export type NamespaceInput = Pick<StoreConfigInput, "tables">;
