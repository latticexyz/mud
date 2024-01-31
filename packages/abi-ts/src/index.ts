import type { CommandModule } from "yargs";
import { readFileSync, writeFileSync } from "fs";
import glob from "glob";
import { debug } from "./debug";

type Options = {
  input: string;
  output: string;
};

const commandModule: CommandModule<Options, Options> = {
  command: "abi-ts",

  describe: "Convert a directory of JSON ABI files to a directory of TS files with `as const`",

  builder(yargs) {
    return yargs.options({
      input: {
        type: "string",
        desc: "Input glob of ABI JSON files",
        default: "**/*.abi.json",
      },
    });
  },

  handler({ input }) {
    const files = glob.sync(input);

    if (!files.length) {
      console.error(`No files found for glob: ${input}`);
      process.exit(1);
    }

    for (const jsonFilename of files) {
      const json = readFileSync(jsonFilename, "utf8").trim();
      if (json === "[]") {
        debug("Skipping empty ABI file", jsonFilename);
        continue;
      }

      const ts = `declare const abi: ${json}; export default abi;\n`;
      const tsFilename = `${jsonFilename}.d.ts`;

      debug("Writing", tsFilename);
      writeFileSync(tsFilename, ts);
    }

    process.exit(0);
  },
};

export default commandModule;
