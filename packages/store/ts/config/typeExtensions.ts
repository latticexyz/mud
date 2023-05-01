import { z } from "zod";
import { EnumsConfig, StoreSimpleOptions, TablesConfig, zStoreConfig } from "./parseStoreConfig";

// Inject non-generic options into the core config.
// Re-exporting an interface of an existing module merges them, adding new options to the interface.
// (typescript has no way to override types)
declare module "@latticexyz/config" {
  // Extend the user config type, which represents the config as written by the users.
  // Most things are optional here.
  export interface MUDCoreUserConfig extends StoreSimpleOptions, EnumsConfig<string> {
    tables: TablesConfig<string, string>;
  }

  // Also extend the config type, which represents the configuration after it has been resolved.
  // It should not have any optional properties, with the default values applied instead.
  // Other plugins may receive this resolved config as their input.
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface MUDCoreConfig extends z.output<typeof zStoreConfig> {}
}
