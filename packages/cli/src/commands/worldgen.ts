import path from "node:path";
import type { CommandModule } from "yargs";
import { loadConfig, resolveConfigPath } from "@latticexyz/config/node";
import { World as WorldConfig } from "@latticexyz/world";
import { worldgen } from "@latticexyz/world/node";

type Options = {
  configPath?: string;
  clean?: boolean;
};

const commandModule: CommandModule<Options, Options> = {
  command: "worldgen",

  describe: "Autogenerate interfaces for Systems and World based on existing contracts and the config file",

  builder(yargs) {
    return yargs.options({
      configPath: { type: "string", desc: "Path to the MUD config file" },
      clean: {
        type: "boolean",
        desc: "Clear the worldgen directory before generating new interfaces (defaults to true)",
        default: true,
      },
    });
  },

  async handler(args) {
    await worldgenHandler(args);
    process.exit(0);
  },
};

export async function worldgenHandler(args: Options) {
  const configPath = await resolveConfigPath(args.configPath);
  const config = (await loadConfig(configPath)) as WorldConfig;
  const rootDir = path.dirname(configPath);

  await worldgen({ rootDir, config, clean: args.clean });
}

export default commandModule;
