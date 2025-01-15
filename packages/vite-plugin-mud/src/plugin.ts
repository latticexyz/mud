import { Plugin } from "vite";
import { loadEnv } from "vite";
import path from "node:path";
import fs from "node:fs/promises";

export function mud(opts: { worldsFile: string }): Plugin {
  const rootDir = process.cwd();
  const worldsFile = path.resolve(rootDir, opts.worldsFile);

  async function isReadable(filename: string) {
    try {
      await fs.access(filename, fs.constants.R_OK);
      return true;
    } catch {
      return false;
    }
  }

  return {
    name: "vite-plugin-mud",
    async config(config, { mode }) {
      const env = Object.assign({}, process.env, loadEnv(mode, rootDir));
      const chainId = Number(env.VITE_CHAIN_ID) || 31337;

      config.define ??= {};
      config.define["import.meta.env.CHAIN_ID"] = chainId;

      if (!(await isReadable(worldsFile))) {
        console.log("no worlds file");
        return;
      }

      const worlds = JSON.parse(await fs.readFile(worldsFile, "utf-8")) as Partial<
        Record<string, { address: `0x${string}`; blockNumber?: number }>
      >;

      const world = worlds[chainId];
      if (world) {
        config.define["import.meta.env.WORLD_ADDRESS"] = JSON.stringify(world.address);
        config.define["import.meta.env.START_BLOCK"] = world.blockNumber != null ? `${world.blockNumber}n` : undefined;
      } else {
        console.log("no world deploy for chain ID", chainId);
      }
    },
    configureServer(server) {
      server.watcher.add(worldsFile);

      server.watcher.on("add", handleFileChange);
      server.watcher.on("change", handleFileChange);
      server.watcher.on("unlink", handleFileChange);

      // Wrap server restart in a delay to "debounce" so we
      // only restart once after all file change emissions complete.
      let timer: ReturnType<typeof setTimeout> | undefined;
      function restart() {
        clearTimeout(timer);
        timer = setTimeout(() => server.restart(), 500);
      }

      function handleFileChange(filename: string) {
        // TODO: check if this works on windows, as paths may have different separators
        if (filename === worldsFile) {
          restart();
        }
      }
    },
  };
}
