import type { CommandModule } from "yargs";
import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { globSync } from "glob";
import { debug } from "./debug";

type Options = {
  input: string;
  extension: string;
};

export const command: CommandModule<Options, Options> = {
  command: "abi-ts",

  describe: "Convert a directory of JSON ABI files to a directory of TS or DTS files with `as const`.",

  builder(yargs) {
    return yargs.options({
      input: {
        type: "string",
        desc: "Input glob of ABI JSON files.",
        default: "**/*.abi.json",
      },
      extension: {
        type: "string",
        desc: "Extension of the resulting ABI TS or DTS file.",
        default: ".json.d.ts",
      },
    });
  },

  handler({ input, extension: tsExtension }) {
    const files = globSync(input).sort();

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

      const jsonExtension = path.extname(jsonFilename);
      const tsFilename = `${jsonFilename.substring(0, jsonFilename.lastIndexOf(jsonExtension))}${tsExtension}`;

      const ts = tsExtension.includes(".d.")
        ? `declare const abi: ${json};\n\nexport default abi;\n`
        : `const abi = ${json} as const;\n\nexport default abi;\n`;

      debug("Writing", tsFilename);
      writeFileSync(tsFilename, ts);
    }

    process.exit(0);
  },
};
