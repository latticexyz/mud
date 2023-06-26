import { z } from "zod";
import { DEFAULTS } from "./defaults";

export const zMyPluginConfig = z
  .object({
    myNewConfigOption: z.boolean().default(DEFAULTS.myNewConfigOption),
  })
  // Catchall preserves other plugins' options
  .catchall(z.any());
