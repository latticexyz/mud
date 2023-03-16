import { ZodError } from "zod";
import { fromZodErrorCustom } from "../../utils/errors.js";
import { loadConfig } from "../loadConfig.js";
import { WorldConfig } from "./parseWorldConfig.js";
import { resolveWorldConfig } from "./resolveWorldConfig.js";

/**
 * Loads and resolves the world config.
 * @param configPath Path to load the config from. Defaults to "mud.config.mts" or "mud.config.ts"
 * @param existingContracts Optional list of existing contract names to validate system names against. If not provided, no validation is performed. Contract names ending in `System` will be added to the config with default values.
 * @returns Promise of ResolvedWorldConfig object
 */
export async function loadWorldConfig(configPath?: string, existingContracts?: string[]) {
  const config = await loadConfig(configPath);

  try {
    const parsedConfig = WorldConfig.parse(config);
    return resolveWorldConfig(parsedConfig, existingContracts);
  } catch (error) {
    if (error instanceof ZodError) {
      throw fromZodErrorCustom(error, "WorldConfig Validation Error");
    } else {
      throw error;
    }
  }
}
