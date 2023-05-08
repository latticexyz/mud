import { OrDefaults } from "@latticexyz/common/type-utils";
import { ModuleConfig } from "./modules";
import { SystemConfig } from "./systems";
import { WORLD_DEFAULTS } from "../defaults";

export type WorldConfig = {
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
  overrideSystems?: Record<string, SystemConfig>;
  /** Systems to exclude from automatic deployment */
  excludeSystems?: readonly string[];
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
  modules?: readonly ModuleConfig[];
};

export type ExpandedWorldConfig<C extends WorldConfig> = OrDefaults<C, typeof WORLD_DEFAULTS> &
  Omit<C, keyof typeof WORLD_DEFAULTS>;
