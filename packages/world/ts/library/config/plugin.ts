import { MudPlugin } from "@latticexyz/config";
import { expandConfig } from "./expandConfig";
import { Config, Expanded } from "./types";

export const worldPlugin = {
  id: "mud-world-plugin",
  expandConfig,
} as const satisfies MudPlugin<Config, Expanded<Config>>;
