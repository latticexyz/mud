import { defineMUDPlugin, fromZodErrorCustom } from "@latticexyz/config";
import { ZodError } from "zod";
import { WorldUserConfig, ExpandWorldUserConfig } from "./types";
import { zPluginWorldConfig } from "./worldConfig";

export function expandConfig<C extends WorldUserConfig>(config: C) {
  // This function gets called within mudConfig.
  // The call order of config extenders depends on their order in the `plugins` config option.
  // Any config validation and transformation should be placed here.
  try {
    return zPluginWorldConfig.parse(config) as ExpandWorldUserConfig<C>;
  } catch (error) {
    if (error instanceof ZodError) {
      throw fromZodErrorCustom(error, "WorldConfig Validation Error");
    } else {
      throw error;
    }
  }
}

export const worldPlugin = defineMUDPlugin({
  id: "mud-world-plugin",
  expandConfig,
} as const);
