import { evaluate } from "@arktype/util";
import {
  NamespaceInput as StoreNamespaceInput,
  StoreInput,
  StoreWithShorthandsInput,
} from "@latticexyz/store/config/v2";
import { DynamicResolution, ValueWithType } from "./dynamicResolution";
import { SystemDeploy } from "./output";
import { Hex } from "viem";

export type SystemDeployInput = Partial<SystemDeploy>;

export type SystemInput = {
  /** System namespace. Defaults to root namespace. */
  namespace?: string;
  /** System name. */
  name: string;
  /** Override the system ID. Defaults to resource ID from system namespace and name. */
  systemId?: Hex;
  /** Filename of the system. Defaults to `{namespace}__{name}System.sol`. */
  filename?: string;
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
  deploy: SystemDeployInput;
};

export type SystemsInput = {
  /**
   * `key` corresponds to the system name being registered.
   */
  readonly [key: string]: Omit<SystemInput, "namespace" | "name">;
};

type ModuleInputArtifactPath =
  | {
      /**
       * Import path to module's forge/solc JSON artifact with the module's compiled bytecode. This is used to create consistent, deterministic deploys for already-built modules
       * like those installed and imported from npm.
       *
       * This path is resolved using node's module resolution, so this supports both relative file paths (`../path/to/MyModule.json`) as well as JS import paths
       * (`@latticexyz/world-modules/out/CallWithSignatureModule.sol/CallWithSignatureModule.json`).
       */
      readonly artifactPath: string;
      readonly name?: never;
    }
  | {
      /**
       * The name of the module, used to construct the import path relative to the project directory.
       * @deprecated Use `artifactPath` instead.
       */
      readonly name: string;
      readonly artifactPath?: never;
    };

export type ModuleInput = ModuleInputArtifactPath & {
  /**
   * Should this module be installed as a root module?
   * @default false
   * */
  readonly root?: boolean;
  /** Arguments to be passed to the module's install method */
  // TODO: make more strongly typed by taking in tables input
  readonly args?: readonly (ValueWithType | DynamicResolution)[];
};

export type DeployInput = {
  /** The name of a custom World contract to deploy. If no name is provided, a default MUD World is deployed. */
  // TODO: implement
  customWorldContract?: never;
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

export type NamespaceInput = StoreNamespaceInput & {
  /**
   * Contracts named *System will be deployed by default
   * as public systems at `namespace/ContractName`, unless overridden
   *
   * The key is the system name (capitalized).
   * The value is a SystemConfig object.
   */
  systems?: SystemsInput;
};

export type SingleNamespaceInput = { namespace?: string } & NamespaceInput;

export type NamespacesInput = { [key: string]: NamespaceInput };

export type WorldInput = evaluate<
  StoreInput &
    SingleNamespaceInput & {
      namespaces?: NamespacesInput;
      /**
       * System names to exclude from automatic deployment.
       * @deprecated Use `deploy: { disabled: true }` within your system config instead.
       */
      excludeSystems?: readonly string[];
      /** Modules to in the World */
      modules?: readonly ModuleInput[];
      /** Deploy config */
      deploy?: DeployInput;
      /** Codegen config */
      codegen?: CodegenInput;
    }
>;

/******** Variations with shorthands ********/

export type WorldWithShorthandsInput = Omit<WorldInput, "tables"> & Pick<StoreWithShorthandsInput, "tables">;
