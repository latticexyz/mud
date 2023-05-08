import { MudPlugin } from "@latticexyz/config";
import { expandConfig } from "./expandConfig";
import { Config, Expanded } from "./types";

export const storePlugin = {
  id: "mud-store-plugin",
  expandConfig,
} as const satisfies MudPlugin<Config, Expanded<Config>>;
