import { OrDefaults } from "@latticexyz/common/type-utils";
import {
  ExpandWorldNamespacedConfig,
  WorldConfig,
  WorldNamespacedConfig,
  WorldUserConfig,
  WORLD_DEFAULTS,
} from "../library";

import "@latticexyz/store/register";

// Inject the plugin options into the core config.
// Re-exporting an interface of an existing module merges them, adding new options to the interface.
// (typescript has no way to override types)
declare module "@latticexyz/config" {
  // Extend the user config type, which represents the config as written by the users.
  // Most things are optional here.
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface MUDCoreUserConfig extends Omit<WorldUserConfig, "namespaces"> {}

  // Also extend the config type, which represents the configuration after it has been resolved.
  // It should not have any optional properties, with the default values applied instead.
  // Other plugins may receive this resolved config as their input.
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface MUDCoreConfig extends Omit<WorldConfig, "namespaces"> {}

  // Finally extend the config expander type, which resolves the user type, using defaults where necessary.
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface ExpandMUDUserConfig<T extends MUDCoreUserConfig>
    extends OrDefaults<
      T,
      {
        worldContractName: typeof WORLD_DEFAULTS.worldContractName;
        worldInterfaceName: typeof WORLD_DEFAULTS.worldInterfaceName;
        postDeployScript: typeof WORLD_DEFAULTS.postDeployScript;
        deploysDirectory: typeof WORLD_DEFAULTS.deploysDirectory;
        worldsFile: typeof WORLD_DEFAULTS.worldsFile;
        worldgenDirectory: typeof WORLD_DEFAULTS.worldgenDirectory;
        worldImportPath: typeof WORLD_DEFAULTS.worldImportPath;
        modules: typeof WORLD_DEFAULTS.modules;
      }
    > {}
}

declare module "@latticexyz/store" {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface NamespacedConfig extends WorldNamespacedConfig {}

  // eslint-disable-next-line @typescript-eslint/no-empty-interface, @typescript-eslint/no-unused-vars
  export interface ExpandNamespacedConfig<T extends NamespacedConfig<string, string>, Namespace extends string>
    extends ExpandWorldNamespacedConfig<T> {}
}
