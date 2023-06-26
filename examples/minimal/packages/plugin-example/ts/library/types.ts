import { z } from "zod";
import { OrDefaults } from "@latticexyz/common/type-utils";
import { zMyPluginConfig } from "./config";
import { DEFAULTS } from "./defaults";

// zod doesn't preserve doc comments
export interface MyPluginUserConfig {
  /** Add a description for your option */
  myNewConfigOption?: boolean;
}

export type MyPluginConfig = z.output<typeof zMyPluginConfig>;

export type ExpandMyPluginConfig<C extends MyPluginUserConfig> = OrDefaults<
  C,
  {
    myNewConfigOption: typeof DEFAULTS.myNewConfigOption;
  }
>;
