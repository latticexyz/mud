import { existsSync, readFileSync } from "fs";
import path from "path";
import chalk from "chalk";
import { ethers } from "ethers";
import { TransactionReceipt, TransactionResponse } from "@ethersproject/providers";
import { defaultAbiCoder as abi, Fragment, ParamType } from "ethers/lib/utils.js";

import { getOutDirectory, getScriptDirectory, cast, forge } from "@latticexyz/common/foundry";
import { resolveWithContext } from "@latticexyz/config";
import { MUDError } from "@latticexyz/common/errors";
import { encodeSchema } from "@latticexyz/schema-type/deprecated";
import { StoreConfig } from "@latticexyz/store";
import { resolveAbiOrUserType } from "@latticexyz/store/codegen";
import { WorldConfig, resolveWorldConfig } from "@latticexyz/world";
import { IBaseWorld } from "@latticexyz/world/types/ethers-contracts/IBaseWorld";
import WorldData from "@latticexyz/world/abi/World.sol/World.json" assert { type: "json" };
import IBaseWorldData from "@latticexyz/world/abi/IBaseWorld.sol/IBaseWorld.json" assert { type: "json" };
import CoreModuleData from "@latticexyz/world/abi/CoreModule.sol/CoreModule.json" assert { type: "json" };
import KeysWithValueModuleData from "@latticexyz/world/abi/KeysWithValueModule.sol/KeysWithValueModule.json" assert { type: "json" };
import KeysInTableModuleData from "@latticexyz/world/abi/KeysInTableModule.sol/KeysInTableModule.json" assert { type: "json" };
import UniqueEntityModuleData from "@latticexyz/world/abi/UniqueEntityModule.sol/UniqueEntityModule.json" assert { type: "json" };
import { tableIdToHex } from "@latticexyz/common";
import { TxHelper } from "./txHelper";

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
  const { worldContractName, namespace, postDeployScript } = mudConfig;
  const { profile, rpc, privateKey, priorityFeeMultiplier, debug, worldAddress, disableTxWait, pollInterval } =
    deployConfig;
  const forgeOutDirectory = await getOutDirectory(profile);

  // Set up signer for deployment
  const provider = new ethers.providers.StaticJsonRpcProvider(rpc);
  provider.pollingInterval = pollInterval;
  const signer = new ethers.Wallet(privateKey, provider);
  console.log("Deploying from", signer.address);

  // Manual nonce handling to allow for faster sending of transactions without waiting for previous transactions
  const initialNonce = await signer.getTransactionCount();
  console.log("Initial nonce", initialNonce);

  const txHelper = new TxHelper({
    signer,
    initialNonce,
    priorityFeeMultiplier,
    forgeOutDirectory,
    debug: true,
  });

  await txHelper.setInternalFeePerGas(priorityFeeMultiplier);

  // Get block number before deploying
  const blockNumber = Number(await cast(["block-number", "--rpc-url", rpc], { profile }));
  console.log("Start deployment at block", blockNumber);

  // Deploy World
  const worldPromise = {
    World: worldAddress
      ? Promise.resolve(worldAddress)
      : worldContractName
      ? txHelper.deployContractByName(worldContractName, disableTxWait)
      : txHelper.deployContract(IBaseWorldData.abi, WorldData.bytecode, disableTxWait, "World"),
  };

  // TODO: these only need to be deployed once per chain, add a check if they exist already
  const coreModulePromise = txHelper.deployContract(
    CoreModuleData.abi,
    CoreModuleData.bytecode,
    disableTxWait,
    "CoreModule"
  );

  // Deploy Systems
  const systemPromises = Object.keys(resolvedConfig.systems).reduce<Record<string, Promise<string>>>(
    (acc, systemName) => {
      acc[systemName] = txHelper.deployContractByName(systemName, disableTxWait);
      return acc;
    },
    {}
  );

  // Deploy default World modules
  const defaultModules: Record<string, Promise<string>> = {
    // TODO: these only need to be deployed once per chain, add a check if they exist already
    KeysWithValueModule: txHelper.deployContract(
      KeysWithValueModuleData.abi,
      KeysWithValueModuleData.bytecode,
      disableTxWait,
      "KeysWithValueModule"
    ),
    KeysInTableModule: txHelper.deployContract(
      KeysInTableModuleData.abi,
      KeysInTableModuleData.bytecode,
      disableTxWait,
      "KeysInTableModule"
    ),
    UniqueEntityModule: txHelper.deployContract(
      UniqueEntityModuleData.abi,
      UniqueEntityModuleData.bytecode,
      disableTxWait,
      "UniqueEntityModule"
    ),
  };

  // Deploy user Modules
  const userModulePromises = mudConfig.modules
    .filter((module) => !defaultModules[module.name]) // Only deploy user modules here, not default modules
    .reduce<Record<string, Promise<string>>>((acc, module) => {
      acc[module.name] = txHelper.deployContractByName(module.name, disableTxWait);
      return acc;
    }, defaultModules);

  // !!!!! WAITING FOR WORLD HERE !!!!!
  const worldAddressN = await worldPromise.World;

  // Create World contract instance from deployed address
  const WorldContract = new ethers.Contract(worldAddressN, IBaseWorldData.abi, signer) as IBaseWorld;

  const confirmations = disableTxWait ? 0 : 1;

  // Install core Modules (if we are not using an existing world)
  if (!worldAddress) {
    console.log(chalk.blue("Installing core World modules"));
    // CoreModule has to be installed before others so wait
    await txHelper.fastTxExecute(WorldContract, "installRootModule", [await coreModulePromise, "0x"], confirmations);
    console.log(chalk.green("Installed core World modules"));
  }

  // Register namespace
  if (namespace)
    await txHelper.fastTxExecute(WorldContract, "registerNamespace", [toBytes16(namespace)], confirmations);

  // Register tables
  const tablePromises: Promise<TransactionResponse | TransactionReceipt>[] = [];
  const tableIds: { [tableName: string]: Uint8Array } = {};
  for (const [tableName, { name, schema, keySchema }] of Object.entries(mudConfig.tables)) {
    console.log(chalk.blue(`Registering table ${tableName} at ${namespace}/${name}`));

    // Store the tableId for later use
    tableIds[tableName] = toResourceSelector(namespace, name);

    // Register table
    const schemaTypes = Object.values(schema).map((abiOrUserType) => {
      const { schemaType } = resolveAbiOrUserType(abiOrUserType, mudConfig);
      return schemaType;
    });

    const keyTypes = Object.values(keySchema).map((abiOrUserType) => {
      const { schemaType } = resolveAbiOrUserType(abiOrUserType, mudConfig);
      return schemaType;
    });

    tablePromises.push(
      txHelper.fastTxExecute(
        WorldContract,
        "registerTable",
        [
          tableIdToHex(namespace, name),
          encodeSchema(keyTypes),
          encodeSchema(schemaTypes),
          Object.keys(keySchema),
          Object.keys(schema),
        ],
        confirmations
      )
    );

    console.log(chalk.green(`Registered table ${tableName} at ${name}`));
  }

  // Register systems (using forEach instead of for..of to avoid blocking on async calls)
  const systemPromisesNew: Promise<TransactionResponse | TransactionReceipt>[] = [];
  for (const [systemName, { name, openAccess, registerFunctionSelectors }] of Object.entries(resolvedConfig.systems)) {
    // Register system at route
    console.log(chalk.blue(`Registering system ${systemName} at ${namespace}/${name}`));
    systemPromisesNew.push(
      txHelper.fastTxExecute(
        WorldContract,
        "registerSystem",
        [tableIdToHex(namespace, name), await systemPromises[systemName], openAccess],
        confirmations
      )
    );
    console.log(chalk.green(`Registered system ${systemName} at ${namespace}/${name}`));

    // Register function selectors for the system
    if (registerFunctionSelectors) {
      const functionSignatures: FunctionSignature[] = await loadFunctionSignatures(systemName);
      const isRoot = namespace === "";
      for (const { functionName, functionArgs } of functionSignatures) {
        const functionSignature = isRoot
          ? functionName + functionArgs
          : `${namespace}_${name}_${functionName}${functionArgs}`;

        console.log(chalk.blue(`Registering function "${functionSignature}"`));
        if (isRoot) {
          const worldFunctionSelector = toFunctionSelector(
            functionSignature === ""
              ? { functionName: systemName, functionArgs } // Register the system's fallback function as `<systemName>(<args>)`
              : { functionName, functionArgs }
          );
          const systemFunctionSelector = toFunctionSelector({ functionName, functionArgs });
          systemPromisesNew.push(
            txHelper.fastTxExecute(
              WorldContract,
              "registerRootFunctionSelector",
              [tableIdToHex(namespace, name), worldFunctionSelector, systemFunctionSelector],
              confirmations
            )
          );
        } else {
          systemPromisesNew.push(
            txHelper.fastTxExecute(
              WorldContract,
              "registerFunctionSelector",
              [tableIdToHex(namespace, name), functionName, functionArgs],
              confirmations
            )
          );
        }
        console.log(chalk.green(`Registered function "${functionSignature}"`));
      }
    }
  }
  console.log("waiting for tables");
  await Promise.all(tablePromises);
  console.log("waiting for tables done");
  console.log("waiting for systems");
  await Promise.all(systemPromisesNew);
  console.log("waiting for systems done");

  // Grant access to systems
  const grantPromises: Promise<TransactionResponse | TransactionReceipt>[] = [];
  for (const [systemName, { name, accessListAddresses, accessListSystems }] of Object.entries(resolvedConfig.systems)) {
    const resourceSelector = `${namespace}/${name}`;

    // Grant access to addresses
    accessListAddresses.map(async (address) => {
      console.log(chalk.blue(`Grant ${address} access to ${systemName} (${resourceSelector})`));
      grantPromises.push(
        txHelper.fastTxExecute(WorldContract, "grantAccess", [tableIdToHex(namespace, name), address], confirmations)
      );
      console.log(chalk.green(`Granted ${address} access to ${systemName} (${namespace}/${name})`));
    });

    // Grant access to other systems
    accessListSystems.map(async (granteeSystem) => {
      console.log(chalk.blue(`Grant ${granteeSystem} access to ${systemName} (${resourceSelector})`));
      grantPromises.push(
        txHelper.fastTxExecute(
          WorldContract,
          "grantAccess",
          [tableIdToHex(namespace, name), await systemPromises[granteeSystem]],
          confirmations
        )
      );
      console.log(chalk.green(`Granted ${granteeSystem} access to ${systemName} (${resourceSelector})`));
    });
  }
  // Wait for access to be granted before installing modules
  console.log("waiting for grants");
  await Promise.all(grantPromises);
  console.log("waiting for grants done");

  // Install modules
  const modulePromisesNew: Promise<TransactionResponse | TransactionReceipt>[] = [];
  for (const module of mudConfig.modules) {
    console.log(chalk.blue(`Installing${module.root ? " root " : " "}module ${module.name}`));
    // Resolve arguments
    const resolvedArgs = await Promise.all(
      module.args.map((arg) => resolveWithContext(arg, { tableIds, systemAddresses: systemPromises }))
    );
    const values = resolvedArgs.map((arg) => arg.value);
    const types = resolvedArgs.map((arg) => arg.type);
    const moduleAddress = await userModulePromises[module.name];
    if (!moduleAddress) throw new Error(`Module ${module.name} not found`);

    // Send transaction to install module
    modulePromisesNew.push(
      txHelper.fastTxExecute(
        WorldContract,
        module.root ? "installRootModule" : "installModule",
        [moduleAddress, abi.encode(types, values)],
        confirmations
      )
    );

    console.log(chalk.green(`Installed${module.root ? " root " : " "}module ${module.name}`));
  }
  console.log("waiting for modules");
  await Promise.all(modulePromisesNew);
  console.log("waiting for modules done");

  // Confirm the current nonce is the expected nonce to make sure all transactions have been included
  let remoteNonce = await signer.getTransactionCount();
  let retryCount = 0;
  const maxRetries = 100;
  while (remoteNonce !== txHelper.nonce && retryCount < maxRetries) {
    console.log(
      chalk.gray(
        `Waiting for transactions to be included before executing ${postDeployScript} (local nonce: ${txHelper.nonce}, remote nonce: ${remoteNonce}, retry number ${retryCount}/${maxRetries})`
      )
    );
    await new Promise((resolve) => setTimeout(resolve, pollInterval));
    retryCount++;
    remoteNonce = await signer.getTransactionCount();
  }
  if (remoteNonce !== txHelper.nonce) {
    throw new MUDError(
      "Remote nonce doesn't match local nonce, indicating that not all deploy transactions were included."
    );
  }

  // Execute postDeploy forge script
  const postDeployPath = path.join(await getScriptDirectory(), postDeployScript + ".s.sol");
  if (existsSync(postDeployPath)) {
    console.log(chalk.blue(`Executing post deploy script at ${postDeployPath}`));
    await forge(
      ["script", postDeployScript, "--sig", "run(address)", worldAddressN, "--broadcast", "--rpc-url", rpc, "-vvv"],
      {
        profile,
      }
    );
  } else {
    console.log(`No script at ${postDeployPath}, skipping post deploy hook`);
  }

  console.log(chalk.green("Deployment completed in", (Date.now() - startTime) / 1000, "seconds"));

  return { worldAddress: worldAddressN, blockNumber };

  // ------------------- INTERNAL FUNCTIONS -------------------
  // (Inlined to avoid having to pass around nonce, signer and forgeOutDir)

  /**
   * Deploy a contract and return the address
   * @param contractName Name of the contract to deploy (must exist in the file system)
   * @returns Address of the deployed contract
   *
   * NOTE: Forge deploy seems to be slightly slower than ethers
   * (probably due to the extra overhead spawning a child process to run forge),
   * so we mostly use ethersDeployContract here.
   * However, for contracts not in the user directory (eg. the vanilla World contract),
   * using forge is more convenient because it automatically finds the contract in the @latticexyz/world package.
   */
  // async function forgeDeployContract(contractName: string): Promise<string> {
  //   console.log(chalk.blue("Deploying", contractName));

  //   const { deployedTo } = JSON.parse(
  //     await forge(
  //       ["create", contractName, "--rpc-url", rpc, "--private-key", privateKey, "--json", "--nonce", String(nonce++)],
  //       { profile, silent: true }
  //     )
  //   );
  //   return deployedTo;
  // }

  async function loadFunctionSignatures(contractName: string): Promise<FunctionSignature[]> {
    const { abi } = await getContractData(contractName);

    return abi
      .filter((item) => ["fallback", "function"].includes(item.type))
      .map((item) => {
        if (item.type === "fallback") return { functionName: "", functionArgs: "" };

        return {
          functionName: item.name,
          functionArgs: parseComponents(item.inputs),
        };
      });
  }

  /**
   * Recursively turn (nested) structs in signatures into tuples
   */
  function parseComponents(params: ParamType[]): string {
    const components = params.map((param) => {
      const tupleMatch = param.type.match(/tuple(.*)/);
      if (tupleMatch) {
        // there can be arrays of tuples,
        // `tupleMatch[1]` preserves the array brackets (or is empty string for non-arrays)
        return parseComponents(param.components) + tupleMatch[1];
      } else {
        return param.type;
      }
    });
    return `(${components})`;
  }

  /**
   * Load the contract's abi and bytecode from the file system
   * @param contractName: Name of the contract to load
   */
  async function getContractData(contractName: string): Promise<{ bytecode: string; abi: Fragment[] }> {
    let data: any;
    const contractDataPath = path.join(forgeOutDirectory, contractName + ".sol", contractName + ".json");
    try {
      data = JSON.parse(readFileSync(contractDataPath, "utf8"));
    } catch (error: any) {
      throw new MUDError(`Error reading file at ${contractDataPath}`);
    }

    const bytecode = data?.bytecode?.object;
    if (!bytecode) throw new MUDError(`No bytecode found in ${contractDataPath}`);

    const abi = data?.abi;
    if (!abi) throw new MUDError(`No ABI found in ${contractDataPath}`);

    return { abi, bytecode };
  }
}

// TODO: use stringToBytes16 from utils as soon as utils are usable inside cli
// (see https://github.com/latticexyz/mud/issues/499)
function toBytes16(input: string) {
  if (input.length > 16) throw new Error("String does not fit into 16 bytes");

  const result = new Uint8Array(16);
  // Set ascii bytes
  for (let i = 0; i < input.length; i++) {
    result[i] = input.charCodeAt(i);
  }
  // Set the remaining bytes to 0
  for (let i = input.length; i < 16; i++) {
    result[i] = 0;
  }
  return result;
}

// TODO: use TableId from utils as soon as utils are usable inside cli
// (see https://github.com/latticexyz/mud/issues/499)
function toResourceSelector(namespace: string, file: string): Uint8Array {
  const namespaceBytes = toBytes16(namespace);
  const fileBytes = toBytes16(file);
  const result = new Uint8Array(32);
  result.set(namespaceBytes);
  result.set(fileBytes, 16);
  return result;
}

interface FunctionSignature {
  functionName: string;
  functionArgs: string;
}

// TODO: move this to utils as soon as utils are usable inside cli
// (see https://github.com/latticexyz/mud/issues/499)
function toFunctionSelector({ functionName, functionArgs }: FunctionSignature): string {
  const functionSignature = functionName + functionArgs;
  if (functionSignature === "") return "0x";
  return sigHash(functionSignature);
}

// TODO: move this to utils as soon as utils are usable inside cli
// (see https://github.com/latticexyz/mud/issues/499)
function sigHash(signature: string) {
  return ethers.utils.hexDataSlice(ethers.utils.keccak256(ethers.utils.toUtf8Bytes(signature)), 0, 4);
}
