import { World as WorldConfig } from "@latticexyz/world";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { WalletClient } from "viem";
import { getChainId } from "viem/actions";
import chalk from "chalk";

const localChains = [1337, 31337];

export async function writeDeploymentResult({
  client,
  config,
  deploymentInfo,
}: {
  client: WalletClient;
  config: WorldConfig;
  deploymentInfo: {
    worldAddress: `0x${string}`;
    blockNumber: number;
  };
}) {
  const chainId = await getChainId(client);
  const deploysDir = path.join(config.deploy.deploysDirectory, chainId.toString());
  mkdirSync(deploysDir, { recursive: true });
  writeFileSync(path.join(deploysDir, "latest.json"), JSON.stringify(deploymentInfo, null, 2));
  writeFileSync(path.join(deploysDir, Date.now() + ".json"), JSON.stringify(deploymentInfo, null, 2));

  const deploys = existsSync(config.deploy.worldsFile)
    ? JSON.parse(readFileSync(config.deploy.worldsFile, "utf-8"))
    : {};
  deploys[chainId] = {
    address: deploymentInfo.worldAddress,
    // We expect the worlds file to be committed and since local deployments are often
    // a consistent address but different block number, we'll ignore the block number.
    blockNumber: localChains.includes(chainId) ? undefined : deploymentInfo.blockNumber,
  };
  writeFileSync(config.deploy.worldsFile, JSON.stringify(deploys, null, 2));

  console.log(
    chalk.bgGreen(
      chalk.whiteBright(`\n Deployment result (written to ${config.deploy.worldsFile} and ${deploysDir}): \n`),
    ),
  );
}
