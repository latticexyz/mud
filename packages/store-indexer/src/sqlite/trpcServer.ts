import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { appRouter } from "./appRouter";
import { z } from "zod";
import cors from "cors";

const env = z
  .object({
    PORT: z.coerce.number().positive().default(3001),
  })
  .parse(process.env, {
    errorMap: (issue) => ({
      message: `Missing or invalid environment variable: ${issue.path.join(".")}`,
    }),
  });

const server = createHTTPServer({
  middleware: cors(),
  router: appRouter,
});

const { port } = server.listen(env.PORT);
console.log(`tRPC listening on http://127.0.0.1:${port}`);
