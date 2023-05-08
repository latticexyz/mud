import { MudPlugin } from "@latticexyz/config";
import { expandConfig } from "./expandConfig";

export const storePlugin = {
  id: "mud-store-plugin",
  expandConfig,
} as const satisfies MudPlugin;
