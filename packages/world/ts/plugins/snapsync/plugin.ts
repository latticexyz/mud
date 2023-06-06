import { z } from "zod";

export const zSnapSyncPluginConfig = z
  .object({
    snapSync: z.boolean(),
  })
  .catchall(z.any());
