import { ZodError } from "zod";
import { defineMUDPlugin, fromZodErrorCustom } from "@latticexyz/config";
import { zMyPluginConfig } from "./config";
import { ExpandMyPluginConfig, MyPluginUserConfig } from "./types";

function expandConfig<C extends MyPluginUserConfig>(config: C) {
  // This function gets called within mudConfig.
  // The call order of config extenders depends on their order in the `plugins` config option.
  // Any config validation and transformation should be placed here.
  const parsedConfig = (() => {
    try {
      return zMyPluginConfig.parse(config) as ExpandMyPluginConfig<C>;
    } catch (error) {
      if (error instanceof ZodError) {
        throw fromZodErrorCustom(error, "MyPluginConfig Validation Error");
      } else {
        throw error;
      }
    }
  })();

  return parsedConfig;
}

export const myPlugin = defineMUDPlugin({
  id: "my-plugin",
  expandConfig,
} as const);
