import { OrDefaults } from "@latticexyz/common/type-utils";
import { MUDCoreUserConfig } from "@latticexyz/config";
import { ExpandSystemsConfig, WorldConfig, WorldConfigDefaults, WorldUserConfig } from "../library";

import "@latticexyz/store/register";

// Inject the plugin options into the core config.
// Re-exporting an interface of an existing module merges them, adding new options to the interface.
// (typescript has no way to override types)
declare module "@latticexyz/config" {
  // Extend the user config type, which represents the config as written by the users.
  // Most things are optional here.
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface MUDCoreUserConfig extends WorldUserConfig {}

  // Also extend the config type, which represents the configuration after it has been resolved.
  // It should not have any optional properties, with the default values applied instead.
  // Other plugins may receive this resolved config as their input.
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface MUDCoreConfig extends WorldConfig {}
}

declare module "@latticexyz/store" {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface ExpandMUDUserConfig<T extends MUDCoreUserConfig> extends OrDefaults<T, WorldConfigDefaults> {
    overrideSystems: ExpandSystemsConfig<
      T["overrideSystems"] extends Record<string, unknown> ? T["overrideSystems"] : Record<string, never>
    >;
  }
}
