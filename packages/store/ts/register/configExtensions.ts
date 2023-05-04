import { extendMUDCoreConfig, fromZodErrorCustom } from "@latticexyz/config";
import { ZodError } from "zod";
import { zPluginStoreConfig } from "../library/config";

extendMUDCoreConfig((config) => {
  // This function gets called within mudConfig.
  // The call order of config extenders depends on the order of their imports.
  // Any config validation and transformation should be placed here.
  try {
    return zPluginStoreConfig.parse(config);
  } catch (error) {
    if (error instanceof ZodError) {
      throw fromZodErrorCustom(error, "StoreConfig Validation Error");
    } else {
      throw error;
    }
  }
});
