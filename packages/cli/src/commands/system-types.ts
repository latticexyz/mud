import type { Arguments, CommandBuilder } from "yargs";
import { generateSystemTypes } from "../utils";
import { systemsDir } from "../utils/constants";

type Options = {
  outputDir: string;
};

export const command = "system-types";
export const desc = `Generates system type file. Note: assumes contracts of all systems in <forge src path>/${systemsDir} folder, ABIs of all systems in ./abi and typechain generated types in ./types/ethers-contracts`;

export const builder: CommandBuilder<Options, Options> = (yargs) =>
  yargs.options({
    outputDir: {
      type: "string",
      description: "generated types directory, defaults to ./types",
      default: "./types",
    },
  });

export const handler = async (args: Arguments<Options>): Promise<void> => {
  const { outputDir } = args;
  await generateSystemTypes(outputDir);
};
