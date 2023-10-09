import chalk from "chalk";
import path from "path";
import { ethers } from "ethers";
import { getOutDirectory, cast, getSrcDirectory, getRemappings } from "@latticexyz/common/foundry";
import { StoreConfig } from "@latticexyz/store";
import { WorldConfig, resolveWorldConfig } from "@latticexyz/world";
import { deployWorldContract } from "./world";
import IBaseWorldAbi from "@latticexyz/world/out/IBaseWorld.sol/IBaseWorld.abi.json" assert { type: "json" };
import CoreModuleData from "@latticexyz/world/out/CoreModule.sol/CoreModule.json" assert { type: "json" };
import { defaultModuleContracts } from "./modules/constants";
import { getInstallModuleCallData } from "./modules/getInstallModuleCallData";
import { getUserModules } from "./modules/getUserModules";
import { getGrantAccessCallData } from "./systems/getGrantAccessCallData";
import { getRegisterFunctionSelectorsCallData } from "./systems/getRegisterFunctionSelectorsCallData";
import { getRegisterSystemCallData } from "./systems/getRegisterSystemCallData";
import { getRegisterTableCallData } from "./tables/getRegisterTableCallData";
import { getTableIds } from "./tables/getTableIds";
import { confirmNonce } from "./utils/confirmNonce";
import { deployContract } from "./utils/deployContract";
import { fastTxExecute } from "./utils/fastTxExecute";
import { getContractData } from "./utils/getContractData";
import { postDeploy } from "./utils/postDeploy";
import { setInternalFeePerGas } from "./utils/setInternalFeePerGas";
import { ContractCode } from "./utils/types";
import { resourceToHex } from "@latticexyz/common";

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
  const startTime = Date.now();
  const { profile, rpc, privateKey, priorityFeeMultiplier, debug, worldAddress, disableTxWait, pollInterval } =
    deployConfig;
  const resolvedConfig = resolveWorldConfig(mudConfig, existingContractNames);
  const forgeOutDirectory = await getOutDirectory(profile);
  const remappings = await getRemappings(profile);
  const outputBaseDirectory = path.join(await getSrcDirectory(profile), mudConfig.codegenDirectory);

  // Set up signer for deployment
  const provider = new ethers.providers.StaticJsonRpcProvider(rpc);
  provider.pollingInterval = pollInterval;
  const signer = new ethers.Wallet(privateKey, provider);
  console.log("Deploying from", signer.address);

  let nonce = await signer.getTransactionCount();
  console.log("Initial nonce", nonce);

  const txParams = await setInternalFeePerGas(signer, priorityFeeMultiplier);

  const txConfig = {
    ...txParams,
    signer,
    debug: Boolean(debug),
    disableTxWait,
    confirmations: disableTxWait ? 0 : 1,
  };

  // Get block number before deploying
  const blockNumber = Number(await cast(["block-number", "--rpc-url", rpc], { profile }));
  console.log("Start deployment at block", blockNumber);

  // Deploy the World contract. Non-blocking.
  const worldPromise: Promise<string> = worldAddress
    ? Promise.resolve(worldAddress)
    : deployWorldContract({
        ...txConfig,
        nonce: nonce++,
        worldContractName: mudConfig.worldContractName,
        forgeOutDirectory,
      });

  // Filters any default modules from config
  const userModules = getUserModules(defaultModuleContracts, mudConfig.modules);
  const userModuleContracts = userModules.map(({ name }) => {
    const { abi, bytecode } = getContractData(name, forgeOutDirectory);
    return {
      name,
      abi,
      bytecode,
    } as ContractCode;
  });

  const systemContracts = Object.keys(resolvedConfig.systems).map((name) => {
    const { abi, bytecode } = getContractData(name, forgeOutDirectory);
    return {
      name,
      abi,
      bytecode,
    } as ContractCode;
  });

  const contracts: ContractCode[] = [
    {
      name: "CoreModule",
      abi: CoreModuleData.abi,
      bytecode: CoreModuleData.bytecode,
    },
    ...defaultModuleContracts,
    ...userModuleContracts,
    ...systemContracts,
  ];

  // Deploy the System and Module contracts
  const deployedContracts = contracts.reduce<Record<string, Promise<string>>>((acc, contract) => {
    acc[contract.name] = deployContract({
      ...txConfig,
      nonce: nonce++,
      contract,
    });
    return acc;
  }, {});

  // Wait for world to be deployed
  const deployedWorldAddress = await worldPromise;
  const worldContract = new ethers.Contract(deployedWorldAddress, IBaseWorldAbi);

  // If an existing World is passed assume its coreModule is already installed - blocking to install if not
  if (!worldAddress) {
    console.log(chalk.blue("Installing CoreModule"));
    await fastTxExecute({
      ...txConfig,
      nonce: nonce++,
      contract: worldContract,
      func: "initialize",
      args: [await deployedContracts["CoreModule"]],
    });
    console.log(chalk.green("Installed CoreModule"));
  }

  if (mudConfig.namespace) {
    console.log(chalk.blue("Registering Namespace"));
    await fastTxExecute({
      ...txConfig,
      nonce: nonce++,
      contract: worldContract,
      func: "registerNamespace",
      args: [resourceToHex({ type: "namespace", namespace: mudConfig.namespace, name: "" })],
    });
    console.log(chalk.green("Namespace registered"));
  }

  const tableIds = getTableIds(mudConfig);

  const registerTableCalls = Object.values(mudConfig.tables).map((table) =>
    getRegisterTableCallData(table, mudConfig, outputBaseDirectory, remappings)
  );

  console.log(chalk.blue("Registering tables"));
  await Promise.all(
    registerTableCalls.map((call) =>
      fastTxExecute({
        ...txConfig,
        nonce: nonce++,
        contract: worldContract,
        ...call,
      })
    )
  );
  console.log(chalk.green(`Tables registered`));

  console.log(chalk.blue("Registering Systems and Functions"));
  const systemCalls = await Promise.all(
    Object.entries(resolvedConfig.systems).map(([systemKey, system]) =>
      getRegisterSystemCallData({
        systemContracts: deployedContracts,
        systemKey,
        system,
        namespace: mudConfig.namespace,
      })
    )
  );
  const functionCalls = Object.entries(resolvedConfig.systems).flatMap(([systemKey, system]) =>
    getRegisterFunctionSelectorsCallData({
      systemContractName: systemKey,
      system,
      namespace: mudConfig.namespace,
      forgeOutDirectory,
    })
  );
  await Promise.all(
    [...systemCalls, ...functionCalls].map((call) =>
      fastTxExecute({
        ...txConfig,
        nonce: nonce++,
        contract: worldContract,
        ...call,
      })
    )
  );
  console.log(chalk.green(`Systems and Functions registered`));

  // Wait for System access to be granted before installing modules
  const grantCalls = await getGrantAccessCallData({
    systems: Object.values(resolvedConfig.systems),
    systemContracts: deployedContracts,
    namespace: mudConfig.namespace,
  });

  console.log(chalk.blue("Granting Access"));
  await Promise.all(
    grantCalls.map((call) =>
      fastTxExecute({
        ...txConfig,
        nonce: nonce++,
        contract: worldContract,
        ...call,
      })
    )
  );
  console.log(chalk.green(`Access granted`));

  const moduleCalls = await Promise.all(
    mudConfig.modules.map((m) => getInstallModuleCallData(deployedContracts, m, tableIds))
  );

  console.log(chalk.blue("Installing User Modules"));
  await Promise.all(
    moduleCalls.map((call) =>
      fastTxExecute({
        ...txConfig,
        nonce: nonce++,
        contract: worldContract,
        ...call,
      })
    )
  );
  console.log(chalk.green(`User Modules Installed`));

  // Double check that all transactions have been included by confirming the current nonce is the expected nonce
  await confirmNonce(signer, nonce, pollInterval);

  await postDeploy(mudConfig.postDeployScript, deployedWorldAddress, rpc, profile);

  console.log(chalk.green("Deployment completed in", (Date.now() - startTime) / 1000, "seconds"));

  return { worldAddress: deployedWorldAddress, blockNumber };
}
