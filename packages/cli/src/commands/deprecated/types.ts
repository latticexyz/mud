import type { CommandModule } from "yargs";
import { generateTypes } from "../../utils/deprecated/index";

type Options = {
  abiDir?: string;
  outputDir: string;
};

const commandModule: CommandModule<Options, Options> = {
  command: "types",

  describe: "Generates typescript types for contracts and systems.",

  builder(yargs) {
    return yargs.options({
      abiDir: {
        type: "string",
        description: "Input directory of existing ABI to use to generate types. If not provided, contracts are built.",
      },
      outputDir: {
        type: "string",
        description: "Output directory for generated types. Defaults to ./types",
        default: "./types",
      },
    });
  },

  async handler({ abiDir, outputDir }) {
    await generateTypes(abiDir, outputDir, { clear: true });
  },
};

export default commandModule;
