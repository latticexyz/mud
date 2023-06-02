import { z } from "zod";

export const zFactoryPluginConfig = z.object({}).catchall(z.any());
