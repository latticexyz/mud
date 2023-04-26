import { EnumsConfig, StoreSimpleOptions, TablesConfig } from "./parseStoreConfig";

// Inject non-generic options into the core config
declare module "@latticexyz/config" {
  export interface MUDCoreUserConfig extends StoreSimpleOptions, EnumsConfig<string> {
    tables: TablesConfig<string, string>;
  }
}
