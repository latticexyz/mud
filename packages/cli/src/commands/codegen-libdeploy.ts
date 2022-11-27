import type { Arguments, CommandBuilder } from "yargs";
import ejs from "ejs";
import { readFileSync, writeFileSync } from "fs";

type Options = {
  config: string;
  out: string;
  onlySystem?: string;
};

export const command = "codegen-libdeploy";
export const desc = "Generate LibDeploy.sol from given deploy config";
const contractsDir = __dirname + "/../../src/contracts";

export const builder: CommandBuilder<Options, Options> = (yargs) =>
  yargs.options({
    config: { type: "string", default: "./deploy.json", desc: "Component and system deployment configuration" },
    out: { type: "string", default: ".", desc: "Output directory for LibDeploy.sol" },
    onlySystem: { type: "string", desc: "Only generate deploy code for the given system" },
  });

export const handler = async (args: Arguments<Options>): Promise<void> => {
  const { config: configPath, out, onlySystem } = args;

  // Parse config
  const config = JSON.parse(readFileSync(configPath, { encoding: "utf8" }));

  console.log("Deploy config before filter: \n", JSON.stringify(config, null, 2));
  console.log("Filter for", onlySystem);

  // Filter systems
  if (onlySystem) {
    config.systems = config.systems.filter((system: { name: string }) => system.name === onlySystem);
  }

  console.log(`Deploy config after filter for ${onlySystem}: \n`, JSON.stringify(config, null, 2));

  // Generate LibDeploy
  console.log("Generating deployment script");
  const LibDeploy = await ejs.renderFile(contractsDir + "/LibDeploy.ejs", config, { async: true });
  writeFileSync(out + "/LibDeploy.sol", LibDeploy);

  process.exit(0);
};
