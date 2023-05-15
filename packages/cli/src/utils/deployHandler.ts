import chalk from "chalk";
import glob from "glob";
import path, { basename } from "path";
import { loadConfig, MUDError } from "@latticexyz/config";
import { StoreConfig } from "@latticexyz/store";
import { WorldConfig } from "@latticexyz/world";
import { deploy } from "../utils/deploy-v2";
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
  saveDeployment: boolean;
  rpc?: string;
  worldAddress?: string;
  srcDir?: string;
  disableTxWait: boolean;
};

export async function deployHandler(args: DeployOptions) {
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
}
