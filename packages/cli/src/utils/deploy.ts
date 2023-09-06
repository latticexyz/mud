import { existsSync } from "fs";
import path from "path";
import chalk from "chalk";
import { BigNumber, ethers } from "ethers";
import { getOutDirectory, cast, getScriptDirectory, forge } from "@latticexyz/common/foundry";
import { StoreConfig } from "@latticexyz/store";
import { WorldConfig, resolveWorldConfig } from "@latticexyz/world";
import { deployContractsByName, TxHelper, ContractCode, deployContractsByCode, deployContract } from "./txHelper";
import { deployWorldContract as deployWorld, registerNamesSpace, registerTables } from "./world";
import { installCoreModule } from "./coreModules";
import { IBaseWorld } from "@latticexyz/world/types/ethers-contracts/IBaseWorld";
import { grantAccess, registerSystems } from "./systems";
import { installModules, getUserModules } from "./modules";
import IBaseWorldData from "@latticexyz/world/abi/IBaseWorld.sol/IBaseWorld.json" assert { type: "json" };
import KeysWithValueModuleData from "@latticexyz/world/abi/KeysWithValueModule.sol/KeysWithValueModule.json" assert { type: "json" };
import KeysInTableModuleData from "@latticexyz/world/abi/KeysInTableModule.sol/KeysInTableModule.json" assert { type: "json" };
import UniqueEntityModuleData from "@latticexyz/world/abi/UniqueEntityModule.sol/UniqueEntityModule.json" assert { type: "json" };
import CoreModuleData from "@latticexyz/world/abi/CoreModule.sol/CoreModule.json" assert { type: "json" };

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
  // These modules are always deployed
  const defaultModules: ContractCode[] = [
    {
      name: "KeysWithValueModule",
      abi: KeysWithValueModuleData.abi,
      bytecode: KeysWithValueModuleData.bytecode,
    },
    {
      name: "KeysInTableModule",
      abi: KeysInTableModuleData.abi,
      bytecode: KeysInTableModuleData.bytecode,
    },
    {
      name: "UniqueEntityModule",
      abi: UniqueEntityModuleData.abi,
      bytecode: UniqueEntityModuleData.bytecode,
    },
  ];

  // Filters any default modules from config
  const userModules = getUserModules(defaultModules, mudConfig.modules);
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
  const txConfig = {
    signer,
    nonce: txHelper.nonce,
    maxPriorityFeePerGas: txHelper.maxPriorityFeePerGas as number,
    maxFeePerGas: txHelper.maxFeePerGas as BigNumber,
    gasPrice: txHelper.gasPrice as BigNumber,
    debug: !!debug,
    disableTxWait,
  };

  const confirmations = disableTxWait ? 0 : 1;

  // Get block number before deploying
  const blockNumber = Number(await cast(["block-number", "--rpc-url", rpc], { profile }));
  console.log("Start deployment at block", blockNumber);

  // Deploy all contracts - World, Core, Systems, Module. Non-blocking.
  const worldPromise: Promise<string> = deployWorld({
    ...txConfig,
    worldAddress,
    worldContractName: mudConfig.worldContractName,
    forgeOutDirectory,
  });
  txConfig.nonce++;

  console.log(chalk.blue(`Deploying CoreModule`));

  // TODO: This only needs to be deployed once per chain, add a check if they exist already (use create2)
  const coreModulePromise = deployContract({
    ...txConfig,
    contract: {
      name: "CoreModule",
      abi: CoreModuleData.abi,
      bytecode: CoreModuleData.bytecode,
    },
  });
  txConfig.nonce++;

  const defaultModuleContracts = deployContractsByCode({
    ...txConfig,
    contracts: defaultModules,
  });
  txConfig.nonce = txConfig.nonce + Object.keys(defaultModules).length;

  const userModuleContracts = deployContractsByName({
    ...txConfig,
    contracts: Object.keys(userModules),
    forgeOutDirectory,
  });
  txConfig.nonce = txConfig.nonce + Object.keys(userModules).length;

  const moduleContracts = { ...defaultModuleContracts, ...userModuleContracts };

  const systemContracts = deployContractsByName({
    ...txConfig,
    contracts: Object.keys(resolvedConfig.systems),
    forgeOutDirectory,
  });
  txConfig.nonce = txConfig.nonce + Object.keys(resolvedConfig.systems).length;

  txHelper.nonce = txConfig.nonce;

  // Wait for world to be deployed
  const deployedWorldAddress = await worldPromise;
  const worldContract = new ethers.Contract(deployedWorldAddress, IBaseWorldData.abi) as IBaseWorld;

  // If an existing World is passed assume its coreModule is already installed - blocking to install if not
  if (!worldAddress) await installCoreModule(worldContract, await coreModulePromise, disableTxWait, txHelper);

  await registerNamesSpace(txHelper, worldContract, mudConfig.namespace, confirmations);

  // Blocking - Wait for tables to be registered
  const tableIds = await registerTables(txHelper, worldContract, confirmations, mudConfig, mudConfig.namespace);

  // Blocking - Wait for resources to be registered before granting access to them
  await registerSystems(
    txHelper,
    disableTxWait,
    worldContract,
    resolvedConfig.systems,
    systemContracts,
    mudConfig.namespace,
    forgeOutDirectory
  );

  // Blocking - Wait for System access to be granted before installing modules
  await grantAccess(
    txHelper,
    disableTxWait,
    worldContract,
    resolvedConfig.systems,
    mudConfig.namespace,
    systemContracts
  );

  // Blocking - Wait for User Module installs before postDeploy is run
  await installModules(txHelper, disableTxWait, worldContract, mudConfig.modules, tableIds, moduleContracts);

  // Double check that all transactions have been included by confirming the current nonce is the expected nonce
  await txHelper.confirmNonce(pollInterval);

  await postDeploy(mudConfig.postDeployScript, deployedWorldAddress, rpc, profile);

  console.log(chalk.green("Deployment completed in", (Date.now() - startTime) / 1000, "seconds"));

  return { worldAddress: deployedWorldAddress, blockNumber };
}

async function postDeploy(
  postDeployScript: string,
  worldAddress: string,
  rpc: string,
  profile: string | undefined
): Promise<void> {
  // Execute postDeploy forge script
  const postDeployPath = path.join(await getScriptDirectory(), postDeployScript + ".s.sol");
  if (existsSync(postDeployPath)) {
    console.log(chalk.blue(`Executing post deploy script at ${postDeployPath}`));
    await forge(
      ["script", postDeployScript, "--sig", "run(address)", worldAddress, "--broadcast", "--rpc-url", rpc, "-vvv"],
      {
        profile: profile,
      }
    );
  } else {
    console.log(`No script at ${postDeployPath}, skipping post deploy hook`);
  }
}
