import type { CommandModule } from "yargs";
import { loadStoreConfig } from "../config/loadStoreConfig.js";
import { tablegen } from "../render-solidity/tablegen.js";
import { getCodegenDirectory } from "../utils/codegen.js";

type Options = {
  configPath?: string;
};

const commandModule: CommandModule<Options, Options> = {
  command: "tablegen",

  describe: "Autogenerate MUD Store table libraries based on the config file",

  builder(yargs) {
    return yargs.options({
      configPath: { type: "string", desc: "Path to the config file" },
    });
  },

  async handler({ configPath }) {
    const codegenDir = await getCodegenDirectory();

    const config = await loadStoreConfig(configPath);

    await tablegen(config, codegenDir);

    process.exit(0);
  },
};

export default commandModule;
