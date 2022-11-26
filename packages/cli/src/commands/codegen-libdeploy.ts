import type { Arguments, CommandBuilder } from "yargs";
import ejs from "ejs";
import { readFileSync, writeFileSync, rmSync } from "fs";

type Options = {
  config: string;
  out: string;
};

export const command = "codegen-libdeploy";
export const desc = "Generate LibDeploy.sol from given deploy config";
const contractsDir = __dirname + "/../../src/contracts";

export const builder: CommandBuilder<Options, Options> = (yargs) =>
  yargs.options({
    config: { type: "string", default: "./deploy.json", desc: "Component and system deployment configuration" },
    out: { type: "string", default: ".", desc: "Output directory for LibDeploy.sol" },
  });

export const handler = async (args: Arguments<Options>): Promise<void> => {
  const { config: configPath, out } = args;

  // Parse config
  const config = JSON.parse(readFileSync(configPath, { encoding: "utf8" }));
  console.log("Deploy config: \n", JSON.stringify(config, null, 2));

  // Generate LibDeploy
  console.log("Generating deployment script");
  const LibDeploy = await ejs.renderFile(contractsDir + "/LibDeploy.ejs", config, { async: true });
  writeFileSync(out + "/LibDeploy.sol", LibDeploy);

  process.exit(0);
};
