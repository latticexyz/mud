import chalk from "chalk";
import glob from "glob";
import path, { basename } from "path";
import { MUDError } from "@latticexyz/common/errors";
import { loadConfig } from "@latticexyz/config/node";
import { StoreConfig } from "@latticexyz/store";
import { WorldConfig } from "@latticexyz/world";
import { deploy } from "../utils/deploy";
import { forge, getRpcUrl, getSrcDirectory } from "@latticexyz/common/foundry";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
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
  pollInterval: number;
  skipBuild?: boolean;
};

export async function deployHandler(args: DeployOptions) {
  args.profile = args.profile ?? process.env.FOUNDRY_PROFILE;
  const { configPath, printConfig, profile, clean, skipBuild } = args;

  const rpc = args.rpc ?? (await getRpcUrl(profile));
  console.log(
    chalk.bgBlue(
      chalk.whiteBright(`\n Deploying MUD contracts${profile ? " with profile " + profile : ""} to RPC ${rpc} \n`)
    )
  );

  if (clean) await forge(["clean"], { profile });

  // Run forge build
  if (!skipBuild) await forge(["build"], { profile });

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
  if (!privateKey)
    throw new MUDError(
      `Missing PRIVATE_KEY environment variable.
Run 'echo "PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" > .env'
in your contracts directory to use the default anvil private key.`
    );
  const deploymentInfo = await deploy(mudConfig, existingContracts, { ...args, rpc, privateKey });

  if (args.saveDeployment) {
    // Write deployment result to file (latest and timestamp)
    const chainId = await getChainId(rpc);
    const outputDir = path.join(mudConfig.deploysDirectory, chainId.toString());
    mkdirSync(outputDir, { recursive: true });
    writeFileSync(path.join(outputDir, "latest.json"), JSON.stringify(deploymentInfo, null, 2));
    writeFileSync(path.join(outputDir, Date.now() + ".json"), JSON.stringify(deploymentInfo, null, 2));

    const localChains = [1337, 31337];
    const deploys = existsSync(mudConfig.worldsFile) ? JSON.parse(readFileSync(mudConfig.worldsFile, "utf-8")) : {};
    deploys[chainId] = {
      address: deploymentInfo.worldAddress,
      // We expect the worlds file to be committed and since local deployments are often a consistent address but different block number, we'll ignore the block number.
      blockNumber: localChains.includes(chainId) ? undefined : deploymentInfo.blockNumber,
    };
    writeFileSync(mudConfig.worldsFile, JSON.stringify(deploys, null, 2));

    console.log(
      chalk.bgGreen(chalk.whiteBright(`\n Deployment result (written to ${mudConfig.worldsFile} and ${outputDir}): \n`))
    );
  }

  console.log(deploymentInfo);
  return deploymentInfo;
}
