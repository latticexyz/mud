// configExtensions.ts
import { z } from "zod";
import { DEFAULTS } from "./defaults";

// (if your zod schema is complicated, you should put it in a separate library with any other logic)
export const zMyPluginConfig = z
  .object({
    myNewConfigOption: z.boolean().default(DEFAULTS.myNewConfigOption),
  })
  // Catchall preserves other plugins' options
  .catchall(z.any());
