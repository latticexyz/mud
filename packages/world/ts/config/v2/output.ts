import { Config as StoreConfig, Table } from "@latticexyz/store/config/v2";
import { ModuleConfig } from "./input";

export type SystemConfig = {
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

export type SystemsConfig = { readonly [key: string]: SystemConfig };

export type DeploymentConfig = {
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
};

export type CodegenConfig = {
  /** The name of the World interface to generate. (Default `IWorld`) */
  readonly worldInterfaceName: string;
  /** Directory to output system and world interfaces of `worldgen` (Default "world") */
  readonly worldgenDirectory: string;
  /** Path for world package imports. Default is "@latticexyz/world/src/" */
  readonly worldImportPath: string;
};

export type Config = StoreConfig & {
  readonly namespaces: {
    readonly [namespace: string]: {
      readonly tables: {
        readonly [tableName: string]: Table;
      };
    };
  };
  readonly systems: SystemsConfig;
  /** Systems to exclude from automatic deployment */
  readonly excludeSystems: readonly string[];
  /** Modules to in the World */
  readonly modules: readonly ModuleConfig[];
  /** Deployment config */
  readonly deployment: DeploymentConfig;
  /** Codegen config */
  readonly codegen: CodegenConfig;
};
