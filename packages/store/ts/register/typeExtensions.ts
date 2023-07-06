import { ExpandStoreUserConfig, StoreConfig, StoreUserConfig } from "../config";

// Inject non-generic options into the core config.
// Re-exporting an interface of an existing module merges them, adding new options to the interface.
// (typescript has no way to override types)
declare module "@latticexyz/config" {
  // Extend the user config type, which represents the config as written by the users.
  // Most things are optional here.
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface MUDCoreUserConfig extends StoreUserConfig {}

  // Also extend the config type, which represents the configuration after it has been resolved.
  // It should not have any optional properties, with the default values applied instead.
  // Other plugins receive this resolved config as their input.
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface MUDCoreConfig extends StoreConfig {}

  // Finally extend the config expander type, which resolves the user type, using defaults where necessary.
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface ExpandMUDUserConfig<T extends MUDCoreUserConfig> extends ExpandStoreUserConfig<T> {}
}
