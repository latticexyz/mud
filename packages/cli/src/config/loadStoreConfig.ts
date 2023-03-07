import { ZodError } from "zod";
import { fromZodErrorCustom } from "../utils/errors.js";
import { loadConfig } from "./loadConfig.js";
import { parseStoreConfig } from "./parseStoreConfig.js";

export async function loadStoreConfig(configPath?: string) {
  const config = await loadConfig(configPath);

  try {
    return parseStoreConfig(config);
  } catch (error) {
    if (error instanceof ZodError) {
      throw fromZodErrorCustom(error, "StoreConfig Validation Error");
    } else {
      throw error;
    }
  }
}
