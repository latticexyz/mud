import { fromZodErrorCustom, MudPlugin } from "@latticexyz/config";
import { ZodError } from "zod";
import { ExpandStoreUserConfig, StoreUserConfig, zPluginStoreConfig } from "./storeConfig";

export function expandConfig<C extends StoreUserConfig>(config: C) {
  // This function gets called within mudConfig.
  // The call order of config extenders depends on the order of their imports.
  // Any config validation and transformation should be placed here.
  try {
    return zPluginStoreConfig.parse(config) as ExpandStoreUserConfig<C>;
  } catch (error) {
    if (error instanceof ZodError) {
      throw fromZodErrorCustom(error, "StoreConfig Validation Error");
    } else {
      throw error;
    }
  }
}

export const storePlugin = {
  id: "mud-store-plugin",
  expandConfig,
} as const satisfies MudPlugin;
