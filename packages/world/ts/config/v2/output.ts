import { Store } from "@latticexyz/store";
import { Namespace as StoreNamespace } from "@latticexyz/store/config/v2";
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

export type SystemDeploy = {
  /**
   * Whether or not to deploy the system.
   * Defaults to `false`.
   */
  readonly disabled: boolean;
  /**
   * Whether or not to register system functions on the world.
   * System functions are prefixed with the system namespace when registering on the world, so system function names must be unique within their namespace.
   * Defaults to `true`.
   */
  readonly registerWorldFunctions: boolean;
};

export type System = {
  /**
   * Human-readable label for this system. Used as config keys, interface names, and filenames.
   * Labels are not length constrained like resource names, but special characters should be avoided to be compatible with the filesystem, Solidity compiler, etc.
   */
  readonly label: string;
  /**
   * Human-readable label for this system's namespace. Used for namespace config keys and directory names.
   */
  readonly namespaceLabel: string;
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
  /** If openAccess is true, any address can call the system */
  readonly openAccess: boolean;
  /** An array of addresses or system names that can access the system */
  readonly accessList: readonly string[];
  readonly deploy: SystemDeploy;
};

export type Systems = {
  readonly [label: string]: System;
};

// TODO: should we make Namespace an interface that we can extend here instead of overriding?
export type Namespace = StoreNamespace & { readonly systems: Systems };

export type Namespaces = {
  readonly [label: string]: Namespace;
};

export type Deploy = {
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
  /**
   * Deploy the World using a custom implementation. This world must implement the same interface as `World.sol` so that it can initialize core modules, etc.
   * If you want to extend the world with new functions or override existing registered functions, we recommend using [root systems](https://mud.dev/world/systems#root-systems).
   * However, there are rare cases where this may not be enough to modify the native/internal World behavior.
   * Note that deploying a custom World opts out of the world factory, deterministic world deploys, and upgradeable implementation proxy.
   */
  readonly customWorld?: {
    /** Path to custom world source file relative to project root dir. */
    sourcePath: string;
    /** Contract name in custom world source file. */
    name: string;
  };
};

export type Codegen = {
  /**
   * @internal
   * The name of the World interface to generate. (Default `IWorld`)
   */
  readonly worldInterfaceName: string;
  /** Directory to output system and world interfaces of `worldgen` (Default "world") */
  readonly worldgenDirectory: string;
  /**
   * @internal
   * Absolute import path for a package import or starting with `.` for an import relative to project root dir.
   *
   * Defaults to `@latticexyz/world/src` if not set.
   */
  readonly worldImportPath: string;
};

export type World = Omit<Store, "namespaces"> & {
  readonly namespaces: Namespaces;
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
