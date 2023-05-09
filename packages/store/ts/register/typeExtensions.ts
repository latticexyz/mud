import { OrDefaults } from "@latticexyz/common/type-utils";
import { MUDCoreUserConfig } from "@latticexyz/config";
import { ExpandTablesConfig, StoreConfig, StoreUserConfig } from "../library/config";

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
}

// store-specific helper to preserve strong types, depends on store's type extensions to the core config
export interface ExpandMUDUserConfig<T extends MUDCoreUserConfig>
  extends OrDefaults<
    T,
    {
      enums: Record<string, never>;
      namespace: "";
      storeImportPath: "@latticexyz/store/src/";
      userTypesPath: "Types";
      codegenDirectory: "codegen";
    }
  > {
  tables: ExpandTablesConfig<T["tables"]>;
}
