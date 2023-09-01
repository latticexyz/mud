import chalk from "chalk";
import { ethers } from "ethers";
import { getOutDirectory, cast } from "@latticexyz/common/foundry";
import { StoreConfig } from "@latticexyz/store";
import { WorldConfig, resolveWorldConfig } from "@latticexyz/world";
import { TxHelper } from "./txHelper";
import { WorldDeployer } from "./worldDeployer";

export interface DeployConfig {
  profile?: string;
  rpc: string;
  privateKey: string;
  priorityFeeMultiplier: number;
  debug?: boolean;
  worldAddress?: string;
  disableTxWait: boolean;
  pollInterval: number;
}

export interface DeploymentInfo {
  blockNumber: number;
  worldAddress: string;
}

export async function deploy(
  mudConfig: StoreConfig & WorldConfig,
  existingContractNames: string[],
  deployConfig: DeployConfig
): Promise<DeploymentInfo> {
  const resolvedConfig = resolveWorldConfig(mudConfig, existingContractNames);

  const startTime = Date.now();
  const { profile, rpc, privateKey, priorityFeeMultiplier, debug, worldAddress, disableTxWait, pollInterval } =
    deployConfig;
  const forgeOutDirectory = await getOutDirectory(profile);

  // Set up signer for deployment
  const provider = new ethers.providers.StaticJsonRpcProvider(rpc);
  provider.pollingInterval = pollInterval;
  const signer = new ethers.Wallet(privateKey, provider);
  console.log("Deploying from", signer.address);

  const txHelper = new TxHelper({
    signer,
    priorityFeeMultiplier,
    forgeOutDirectory,
    debug,
  });

  await txHelper.initialise();

  const worldDeployer = new WorldDeployer({
    worldAddress,
    txHelper,
    disableTxWait,
    mudConfig,
    systems: resolvedConfig.systems,
    modules: mudConfig.modules,
    forgeOutDirectory,
    rpc,
    profile,
  });

  // Get block number before deploying
  const blockNumber = Number(await cast(["block-number", "--rpc-url", rpc], { profile }));
  console.log("Start deployment at block", blockNumber);

  // Deploy all contracts - World, Core, Systems, Modules
  // Non-blocking as promises are awaited during initialise/install
  worldDeployer.deployContracts();
  // Blocking - Install CoreModule, Register Namespace, Register Tables
  await worldDeployer.initialise();
  // Blocking - Wait for resources to be registered before granting access to them
  await worldDeployer.registerSystems();
  // Blocking - Wait for System access to be granted before installing modules
  await worldDeployer.grantAccessSystems();
  // Blocking - Wait for User Module installs before postDeploy is run
  await worldDeployer.installModules();
  // Double check that all transactions have been included by confirming the current nonce is the expected nonce
  await txHelper.confirmNonce(pollInterval);
  await worldDeployer.postDeploy();
  console.log(chalk.green("Deployment completed in", (Date.now() - startTime) / 1000, "seconds"));
  return { worldAddress: worldDeployer.worldAddress, blockNumber };
}
