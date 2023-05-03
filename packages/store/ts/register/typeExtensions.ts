import { z } from "zod";
import { zStoreConfig } from "../library/config";

// Inject non-generic options into the core config.
// Re-exporting an interface of an existing module merges them, adding new options to the interface.
// (typescript has no way to override types)
declare module "@latticexyz/config/library" {
  // Extend the user config type, which represents the config as written by the users.
  // Most things are optional here.
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface MUDCoreUserConfig extends z.input<typeof zStoreConfig> {}

  // Also extend the config type, which represents the configuration after it has been resolved.
  // It should not have any optional properties, with the default values applied instead.
  // Other plugins receive this resolved config as their input.
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface MUDCoreConfig extends z.output<typeof zStoreConfig> {}
}
