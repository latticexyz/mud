import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { appRouter } from "../src";
import { z } from "zod";

const env = z
  .object({
    PORT: z.coerce.number().positive().default(3001),
  })
  .parse(process.env);

const server = createHTTPServer({
  router: appRouter,
});

server.listen(env.PORT);
