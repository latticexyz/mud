import { z } from "zod";
import { zWorldConfig } from "./parseWorldConfig";

// Inject the plugin options into the core config
declare module "@latticexyz/config" {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface MUDCoreUserConfig extends z.input<typeof zWorldConfig> {}
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface MUDCoreConfig extends z.output<typeof zWorldConfig> {}
}
