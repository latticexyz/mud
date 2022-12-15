import type { Arguments, CommandBuilder } from "yargs";
import { generateLibDeploy } from "../utils";

type Options = {
  config: string;
  out: string;
  systems?: string;
};

export const command = "codegen-libdeploy";
export const desc = "Generate LibDeploy.sol from given deploy config";

export const builder: CommandBuilder<Options, Options> = (yargs) =>
  yargs.options({
    config: { type: "string", default: "./deploy.json", desc: "Component and system deployment configuration" },
    out: { type: "string", default: ".", desc: "Output directory for LibDeploy.sol" },
    systems: { type: "string", desc: "Only generate deploy code for the given systems" },
  });

export const handler = async (args: Arguments<Options>): Promise<void> => {
  const { config, out, systems } = args;
  await generateLibDeploy(config, out, systems);
  process.exit(0);
};
