import { OrDefaults } from "@latticexyz/common/type-utils";
import { MUDCoreUserConfig } from "@latticexyz/config/library";
import { ExpandTablesConfig, StoreConfig, StoreUserConfig } from "../config";
import { DEFAULTS, PATH_DEFAULTS } from "../config/defaults";

// Inject non-generic options into the core config.
// Re-exporting an interface of an existing module merges them, adding new options to the interface.
// (typescript has no way to override types)
declare module "@latticexyz/config/library" {
  // Extend the user config type, which represents the config as written by the users.
  // Most things are optional here.
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface MUDCoreUserConfig extends StoreUserConfig {}

  // Also extend the config type, which represents the configuration after it has been resolved.
  // It should not have any optional properties, with the default values applied instead.
  // Other plugins receive this resolved config as their input.
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface MUDCoreConfig extends StoreConfig {}
}

// store-specific helper to preserve strong types, depends on store's type extensions to the core config
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore this doesn't cause an error I can reproduce in-editor but fails on TSC with a complaint
// about a systems prop that is not being extended
export interface ExpandMUDUserConfig<T extends MUDCoreUserConfig> extends OrDefaults<T, DEFAULTS & PATH_DEFAULTS> {
  tables: ExpandTablesConfig<T["tables"]>;
}
