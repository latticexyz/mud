import { ZodError } from "zod";
import { fromZodErrorCustom } from "../errors";
import { loadConfig } from "../loadConfig";
import { parseStoreConfig } from "./parseStoreConfig";

export async function loadStoreConfig(configPath?: string) {
  const config = await loadConfig(configPath);

  try {
    return parseStoreConfig(config as any);
  } catch (error) {
    if (error instanceof ZodError) {
      throw fromZodErrorCustom(error, "StoreConfig Validation Error");
    } else {
      throw error;
    }
  }
}
