import type { Arguments, CommandBuilder } from "yargs";
import { generateSystemTypes } from "../utils";

type Options = {
  inputDir: string;
  outputDir: string;
};

export const command = "system-types";
export const desc =
  "Generates system type file. Note: assumes ABIs of all systems in ./abi and typechain generated types in ./types/ethers-contracts";

export const builder: CommandBuilder<Options, Options> = (yargs) =>
  yargs.options({
    inputDir: {
      type: "string",
      description: "source systems directory, defaults to ./src/systems",
      default: "./src/systems",
    },
    outputDir: {
      type: "string",
      description: "generated types directory, defaults to ./types",
      default: "./types",
    },
  });

export const handler = async (args: Arguments<Options>): Promise<void> => {
  const { inputDir, outputDir } = args;
  await generateSystemTypes(inputDir, outputDir);
};
