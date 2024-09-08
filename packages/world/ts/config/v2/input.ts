import { StoreInput, NamespaceInput as StoreNamespaceInput } from "@latticexyz/store/config/v2";
import { DynamicResolution, ValueWithType } from "./dynamicResolution";
import { Codegen, SystemDeploy } from "./output";

export type SystemDeployInput = Partial<SystemDeploy>;

export type SystemInput = {
  /**
   * Human-readable system label. Used as config keys, interface names, and filenames.
   * Labels are not length constrained like resource names, but special characters should be avoided to be compatible with the filesystem, Solidity compiler, etc.
   */
  readonly label: string;
  /**
   * Human-readable label for this system's namespace. Used for namespace config keys and directory names.
   * Defaults to the nearest namespace in the config or root namespace if not set.
   */
  readonly namespaceLabel?: string;
  /**
   * System namespace used in systems's resource ID and determines access control.
   * Defaults to the nearest namespace in the config or root namespace if not set.
   */
  readonly namespace?: string;
  /**
   * System name used in systems's resource ID.
   * Defaults to the first 16 characters of `label` if not set.
   */
  readonly name?: string;
  /** If openAccess is true, any address can call the system */
  readonly openAccess?: boolean;
  /** An array of addresses or system names that can access the system */
  readonly accessList?: readonly string[];
  readonly deploy?: SystemDeployInput;
};

export type SystemsInput = {
  readonly [label: string]: Omit<SystemInput, "label" | "namespaceLabel" | "namespace">;
};

export type NamespaceInput = StoreNamespaceInput & {
  readonly systems?: SystemsInput;
};

export type NamespacesInput = {
  readonly [label: string]: Omit<NamespaceInput, "label">;
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
   */
  readonly root?: boolean;
  /** Arguments to be passed to the module's install method */
  // TODO: make more strongly typed by taking in tables input
  readonly args?: readonly (ValueWithType | DynamicResolution)[];
};

export type DeployInput = {
  /**
   * Script to execute after the deployment is complete (Default "PostDeploy").
   * Script must be placed in the forge scripts directory (see foundry.toml) and have a ".s.sol" extension.
   */
  readonly postDeployScript?: string;
  /** Directory to write the deployment info to (Default "./deploys") */
  readonly deploysDirectory?: string;
  /** JSON file to write to with chain -> latest world deploy address (Default "./worlds.json") */
  readonly worldsFile?: string;
  /** Deploy the World as an upgradeable proxy */
  readonly upgradeableWorldImplementation?: boolean;
  /**
   * Deploy the World using a custom implementation. This world must implement the same interface as World.sol so that it can initialize core modules, etc.
   * If you want to extend the world with new functions or override existing registered functions, we recommend using [root systems](https://mud.dev/world/systems#root-systems).
   * However, there are rare cases where this may not be enough to modify the native/internal World behavior.
   * Note that deploying a custom World opts out of the world factory, deterministic world deploys, and upgradeable implementation proxy.
   */
  // TODO: enforce that this can't be used with `upgradeableWorldImplementation`
  readonly customWorld?: {
    sourcePath: string;
    name: string;
    // TODO: constructor calldata
  };
};

export type CodegenInput = Partial<Codegen>;

export type WorldInput = Omit<StoreInput, "namespaces"> & {
  readonly namespaces?: NamespacesInput;
  /**
   * Contracts named *System will be deployed by default
   * as public systems at `namespace/ContractName`, unless overridden
   *
   * The key is the system name (capitalized).
   * The value is a SystemConfig object.
   */
  readonly systems?: SystemsInput;
  /** System names to exclude from codegen and deployment */
  readonly excludeSystems?: readonly string[];
  /** Modules to install in the World */
  readonly modules?: readonly ModuleInput[];
  /** Deploy config */
  readonly deploy?: DeployInput;
  /** Codegen config */
  readonly codegen?: CodegenInput;
};
