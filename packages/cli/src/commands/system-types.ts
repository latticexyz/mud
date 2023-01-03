import type { Arguments, CommandBuilder } from "yargs";
import { generateSystemTypes } from "../utils";

type Options = {
  outputDir: string;
  config: string;
};

export const command = "system-types";
export const desc =
  "Generates system type file. Note: assumes ABIs of all systems in ./abi and typechain generated types in ./types/ethers-contracts";

export const builder: CommandBuilder<Options, Options> = (yargs) =>
  yargs.options({
    outputDir: {
      type: "string",
      description: "generated types directory, defaults to ./types",
      default: "./types",
    },
    config: { type: "string", default: "./deploy.json", desc: "Component and system deployment configuration" },
  });

export const handler = async (args: Arguments<Options>): Promise<void> => {
  const { outputDir, config } = args;
  await generateSystemTypes(outputDir, config);
};
