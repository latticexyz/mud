import { z } from "zod";
import { zMyPluginConfig } from "./config";

// zod doesn't preserve doc comments
export interface MyPluginUserConfig {
  /** Add a description for your option */
  myNewConfigOption?: boolean;
}

export type MyPluginConfig = z.output<typeof zMyPluginConfig>;
