import { defineMUDPlugin, fromZodErrorCustom } from "@latticexyz/config";
import { ZodError } from "zod";
import { ExpandStoreUserConfig, StoreUserConfig, zPluginStoreConfig } from "./storeConfig";

function expandConfig<C extends StoreUserConfig>(config: C) {
  // This function gets called within mudConfig.
  // The call order of config extenders depends on their order in the `plugins` config option.
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

export const storePlugin = defineMUDPlugin({
  id: "mud-store-plugin",
  expandConfig,
} as const);
