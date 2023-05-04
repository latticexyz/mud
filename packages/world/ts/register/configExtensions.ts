import { extendMUDCoreConfig, fromZodErrorCustom } from "@latticexyz/config";
import { ZodError } from "zod";
import { zPluginWorldConfig } from "../library";

extendMUDCoreConfig((config) => {
  // This function gets called within mudConfig.
  // The call order of config extenders depends on the order of their imports.
  // Any config validation and transformation should be placed here.
  try {
    return zPluginWorldConfig.parse(config);
  } catch (error) {
    if (error instanceof ZodError) {
      throw fromZodErrorCustom(error, "WorldConfig Validation Error");
    } else {
      throw error;
    }
  }
});
