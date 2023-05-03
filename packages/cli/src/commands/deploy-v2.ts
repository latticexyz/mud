import chalk from "chalk";
import glob from "glob";
import path, { basename } from "path";
import type { CommandModule, Options } from "yargs";
import { loadConfig } from "@latticexyz/config/library";
import { MUDError } from "@latticexyz/config/library";
import { StoreConfig } from "@latticexyz/store/library";
import { WorldConfig } from "@latticexyz/world/library";
import { deploy } from "../utils/deploy-v2";
import { logError } from "../utils/errors";
import { forge, getRpcUrl, getSrcDirectory } from "@latticexyz/common/foundry";
import { mkdirSync, writeFileSync } from "fs";
import { getChainId } from "../utils/getChainId";

export type DeployOptions = {
  configPath?: string;
  printConfig?: boolean;
  profile?: string;
  priorityFeeMultiplier: number;
  clean?: boolean;
  debug?: boolean;
  saveDeployment?: boolean;
  rpc?: string;
  worldAddress?: string;
  srcDir?: string;
};

export const yDeployOptions = {
  configPath: { type: "string", desc: "Path to the config file" },
  clean: { type: "boolean", desc: "Remove the build forge artifacts and cache directories before building" },
  printConfig: { type: "boolean", desc: "Print the resolved config" },
  profile: { type: "string", desc: "The foundry profile to use" },
  debug: { type: "boolean", desc: "Print debug logs, like full error messages" },
  priorityFeeMultiplier: {
    type: "number",
    desc: "Multiply the estimated priority fee by the provided factor",
    default: 1,
  },
  saveDeployment: { type: "boolean", desc: "Save the deployment info to a file", default: true },
  rpc: { type: "string", desc: "The RPC URL to use. Defaults to the RPC url from the local foundry.toml" },
  worldAddress: { type: "string", desc: "Deploy to an existing World at the given address" },
  srcDir: { type: "string", desc: "Source directory. Defaults to foundry src directory." },
} satisfies Record<keyof DeployOptions, Options>;

export async function deployHandler(args: Parameters<(typeof commandModule)["handler"]>[0]) {
  args.profile = args.profile ?? process.env.FOUNDRY_PROFILE;
  const { configPath, printConfig, profile, clean } = args;

  const rpc = args.rpc ?? (await getRpcUrl(profile));
  console.log(
    chalk.bgBlue(
      chalk.whiteBright(`\n Deploying MUD v2 contracts${profile ? " with profile " + profile : ""} to RPC ${rpc} \n`)
    )
  );

  if (clean) await forge(["clean"], { profile });

  // Run forge build
  await forge(["build"], { profile });

  // Get a list of all contract names
  const srcDir = args?.srcDir ?? (await getSrcDirectory());
  const existingContracts = glob
    .sync(`${srcDir}/**/*.sol`)
    // Get the basename of the file
    .map((path) => basename(path, ".sol"));

  // Load the config
  const mudConfig = (await loadConfig(configPath)) as StoreConfig & WorldConfig;

  if (printConfig) console.log(chalk.green("\nResolved config:\n"), JSON.stringify(mudConfig, null, 2));

  try {
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) throw new MUDError("Missing PRIVATE_KEY environment variable");
    const deploymentInfo = await deploy(mudConfig, existingContracts, { ...args, rpc, privateKey });

    if (args.saveDeployment) {
      // Write deployment result to file (latest and timestamp)
      const chainId = await getChainId(rpc);
      const outputDir = path.join(mudConfig.deploysDirectory, chainId.toString());
      mkdirSync(outputDir, { recursive: true });
      writeFileSync(path.join(outputDir, "latest.json"), JSON.stringify(deploymentInfo, null, 2));
      writeFileSync(path.join(outputDir, Date.now() + ".json"), JSON.stringify(deploymentInfo, null, 2));

      console.log(chalk.bgGreen(chalk.whiteBright(`\n Deployment result (written to ${outputDir}): \n`)));
    }

    console.log(deploymentInfo);
    return deploymentInfo;
  } catch (error: any) {
    logError(error);
    process.exit(1);
  }
}

const commandModule: CommandModule<DeployOptions, DeployOptions> = {
  command: "deploy-v2",

  describe: "Deploy MUD v2 contracts",

  builder(yargs) {
    return yargs.options(yDeployOptions);
  },

  async handler(args) {
    await deployHandler(args);
    process.exit(0);
  },
};

export default commandModule;
