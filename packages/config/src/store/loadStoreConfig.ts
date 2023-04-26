import { ZodError } from "zod";
import { fromZodErrorCustom } from "../errors.js";
import { loadConfig } from "../loadConfig.js";
import { parseStoreConfig } from "./parseStoreConfig.js";

export async function loadStoreConfig(configPath?: string) {
  const config = await loadConfig(configPath);

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return parseStoreConfig(config as any);
  } catch (error) {
    if (error instanceof ZodError) {
      throw fromZodErrorCustom(error, "StoreConfig Validation Error");
    } else {
      throw error;
    }
  }
}
