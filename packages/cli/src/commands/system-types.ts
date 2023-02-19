import type { CommandModule } from "yargs";
import { generateSystemTypes } from "../utils/index.js";
import { systemsDir } from "../utils/constants";

type Options = {
  outputDir: string;
};

const commandModule: CommandModule<Options, Options> = {
  command: "system-types",

  describe: `Generates system type file. Note: assumes contracts of all systems in <forge src path>/${systemsDir} folder, ABIs of all systems in ./abi and typechain generated types in ./types/ethers-contracts`,

  builder(yargs) {
    return yargs.options({
      outputDir: {
        type: "string",
        description: "generated types directory, defaults to ./types",
        default: "./types",
      },
    });
  },

  async handler({ outputDir }) {
    await generateSystemTypes(outputDir);
  },
};

export default commandModule;
