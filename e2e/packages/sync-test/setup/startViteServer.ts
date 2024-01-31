import { ViteDevServer, createServer } from "vite";

export async function startViteServer(): Promise<ViteDevServer> {
  // TODO this should probably be preview instead of dev server
  const mode = "development";
  const server = await createServer({
    mode,
    server: { port: 3000 },
    root: "../client-vanilla",
  });
  await server.listen();
  return server;
}
