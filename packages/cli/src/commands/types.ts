import { Arguments, CommandBuilder } from "yargs";
import { runTypeChain, glob } from "typechain";
import { resourceLimits } from "worker_threads";

type Options = {
  input: string | undefined;
  out: string | undefined;
};

export const command = "types";
export const desc =
  "Generates TypeChain types. Note: assumes ABIs of all compiled contracts in ./abi. Generated files are exported to ./types/ethers-contracts";

export const builder: CommandBuilder<Options, Options> = (yargs) =>
  yargs.options({
    input: {
      type: "string",
      description: "source abis directory, defaults to ./abi",
      default: "./abi",
    },
    out: {
      type: "string",
      description: "generated types directory, defaults to ./types/ethers-contracts",
      default: "./types/ethers-contracts",
    },
  });

export const handler = async (args: Arguments<Options>): Promise<void> => {
  const { input, out } = args;

  const wd = process.cwd();

  const allFiles = glob(wd, [`${input!}/**/+([a-zA-Z0-9_]).json`]);

  console.log("Generating TypeChain files:");

  const result = await runTypeChain({
    cwd: wd,
    filesToProcess: allFiles,
    allFiles,
    outDir: out!,
    target: "ethers-v5",
  });

  console.log(`Successfully generated ${result.filesGenerated} files`);
};
