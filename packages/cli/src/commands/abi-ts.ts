import type { CommandModule } from "yargs";
import { readFileSync, mkdirSync, writeFileSync } from "fs";
import glob from "glob";
import path from "path";

type Options = {
  input: string;
  output: string;
};

const commandModule: CommandModule<Options, Options> = {
  command: "abi-ts",

  describe: "Convert a directory of JSON ABI files to a directory of TS files using `as const`",

  builder(yargs) {
    return yargs.options({
      input: { type: "string", demandOption: true, desc: "Input directory of `*.abi.json` files" },
      output: { type: "string", demandOption: true, desc: "Output directory for TS `as const` files" },
    });
  },

  handler({ input, output }) {
    const cwd = process.cwd();
    const inputDir = path.join(cwd, input);
    const files = glob.sync(path.join(inputDir, "**/*.abi.json"));
    for (const jsonFilename of files) {
      const json = readFileSync(jsonFilename, "utf8").trim();
      if (json === "[]") {
        console.log("Skipping empty ABI file", jsonFilename);
        continue;
      }
      const ts = `export default ${json} as const;\n`;
      const tsFilename = path.join(cwd, output, path.relative(inputDir, jsonFilename.replace(/\.abi.json$/, ".ts")));
      mkdirSync(path.dirname(tsFilename), { recursive: true });
      console.log("Writing", tsFilename);
      writeFileSync(tsFilename, ts);
    }
    process.exit(0);
  },
};

export default commandModule;
