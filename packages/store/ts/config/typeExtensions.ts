import { z } from "zod";
import { EnumsConfig, StoreSimpleOptions, TablesConfig, zStoreConfig } from "./parseStoreConfig";

// Inject non-generic options into the core config
declare module "@latticexyz/config" {
  export interface MUDCoreUserConfig extends StoreSimpleOptions, EnumsConfig<string> {
    tables: TablesConfig<string, string>;
  }
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface MUDCoreConfig extends z.output<typeof zStoreConfig> {}
}
