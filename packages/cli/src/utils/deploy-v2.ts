import { existsSync, readFileSync } from "fs";
import path from "path";
import { MUDConfig, resolveWithContext } from "../config/index.js";
import { MUDError } from "./errors.js";
import { getOutDirectory, getScriptDirectory, cast, forge } from "./foundry.js";
import { BigNumber, ContractInterface, ethers } from "ethers";
import { IBaseWorld } from "@latticexyz/world/types/ethers-contracts/IBaseWorld.js";
import chalk from "chalk";
import { encodeSchema } from "@latticexyz/schema-type";
import { resolveAbiOrUserType } from "../render-solidity/userType.js";
import { defaultAbiCoder as abi, Fragment } from "ethers/lib/utils.js";

import WorldData from "@latticexyz/world/abi/World.json" assert { type: "json" };
import IBaseWorldData from "@latticexyz/world/abi/IBaseWorld.json" assert { type: "json" };
import CoreModuleData from "@latticexyz/world/abi/CoreModule.json" assert { type: "json" };
import RegistrationModuleData from "@latticexyz/world/abi/RegistrationModule.json" assert { type: "json" };
import KeysWithValueModuleData from "@latticexyz/world/abi/KeysWithValueModule.json" assert { type: "json" };

export interface DeployConfig {
  profile?: string;
  rpc: string;
  privateKey: string;
  priorityFeeMultiplier: number;
  debug?: boolean;
}

export interface DeploymentInfo {
  blockNumber: number;
  worldAddress: string;
}

export async function deploy(mudConfig: MUDConfig, deployConfig: DeployConfig): Promise<DeploymentInfo> {
  const startTime = Date.now();
  const { worldContractName, namespace, postDeployScript } = mudConfig;
  const { profile, rpc, privateKey, priorityFeeMultiplier, debug } = deployConfig;
  const forgeOutDirectory = await getOutDirectory(profile);

  // Set up signer for deployment
  const provider = new ethers.providers.StaticJsonRpcProvider(rpc);
  const signer = new ethers.Wallet(privateKey, provider);

  // Manual nonce handling to allow for faster sending of transactions without waiting for previous transactions
  let nonce = await signer.getTransactionCount();
  console.log("Initial nonce", nonce);

  // Compute maxFeePerGas and maxPriorityFeePerGas like ethers, but allow for a multiplier to allow replacing pending transactions
  let maxPriorityFeePerGas: number;
  let maxFeePerGas: BigNumber;
  setInternalFeePerGas(priorityFeeMultiplier);

  // Catch all to await any promises before exiting the script
  let promises: Promise<unknown>[] = [];

  // Get block number before deploying
  const blockNumber = Number(await cast(["block-number", "--rpc-url", rpc], { profile }));
  console.log("Start deployment at block", blockNumber);

  // Deploy World
  const worldPromise = {
    World: worldContractName
      ? deployContractByName(worldContractName)
      : deployContract(IBaseWorldData.abi, WorldData.bytecode, "World"),
  };

  // Deploy Systems
  const systemPromises = Object.keys(mudConfig.systems).reduce<Record<string, Promise<string>>>((acc, systemName) => {
    acc[systemName] = deployContractByName(systemName);
    return acc;
  }, {});

  // Deploy default World modules
  const defaultModules: Record<string, Promise<string>> = {
    // TODO: these only need to be deployed once per chain, add a check if they exist already
    CoreModule: deployContract(CoreModuleData.abi, CoreModuleData.bytecode, "CoreModule"),
    RegistrationModule: deployContract(
      RegistrationModuleData.abi,
      RegistrationModuleData.bytecode,
      "RegistrationModule"
    ),
    KeysWithValueModule: deployContract(
      KeysWithValueModuleData.abi,
      KeysWithValueModuleData.bytecode,
      "KeysWithValueModule"
    ),
  };

  // Deploy user Modules
  const modulePromises = mudConfig.modules
    .filter((module) => !defaultModules[module.name]) // Only deploy user modules here, not default modules
    .reduce<Record<string, Promise<string>>>((acc, module) => {
      acc[module.name] = deployContractByName(module.name);
      return acc;
    }, defaultModules);

  // Combine all contracts into one object
  const contractPromises: Record<string, Promise<string>> = { ...worldPromise, ...systemPromises, ...modulePromises };

  // Create World contract instance from deployed address
  const WorldContract = new ethers.Contract(await contractPromises.World, IBaseWorldData.abi, signer) as IBaseWorld;

  // Install core Modules
  console.log(chalk.blue("Installing core World modules"));
  await fastTxExecute(WorldContract, "installRootModule", [await modulePromises.CoreModule, "0x"]);
  await fastTxExecute(WorldContract, "installRootModule", [await modulePromises.RegistrationModule, "0x"]);
  console.log(chalk.green("Installed core World modules"));

  // Register namespace
  if (namespace) await fastTxExecute(WorldContract, "registerNamespace", [toBytes16(namespace)]);

  // Register tables
  const tableIds: { [tableName: string]: Uint8Array } = {};
  promises = [
    ...promises,
    ...Object.entries(mudConfig.tables).map(async ([tableName, { fileSelector, schema, primaryKeys }]) => {
      console.log(chalk.blue(`Registering table ${tableName} at ${namespace}/${fileSelector}`));

      // Store the tableId for later use
      tableIds[tableName] = toResourceSelector(namespace, fileSelector);

      // Register table
      const schemaTypes = Object.values(schema).map((abiOrUserType) => {
        const { schemaType } = resolveAbiOrUserType(abiOrUserType, mudConfig);
        return schemaType;
      });

      const keyTypes = Object.values(primaryKeys).map((abiOrUserType) => {
        const { schemaType } = resolveAbiOrUserType(abiOrUserType, mudConfig);
        return schemaType;
      });

      await fastTxExecute(WorldContract, "registerTable", [
        toBytes16(namespace),
        toBytes16(fileSelector),
        encodeSchema(schemaTypes),
        encodeSchema(keyTypes),
      ]);

      // Register table metadata
      await fastTxExecute(WorldContract, "setMetadata(bytes16,bytes16,string,string[])", [
        toBytes16(namespace),
        toBytes16(fileSelector),
        tableName,
        Object.keys(schema),
      ]);

      console.log(chalk.green(`Registered table ${tableName} at ${fileSelector}`));
    }),
  ];

  // Register systems (using forEach instead of for..of to avoid blocking on async calls)
  promises = [
    ...promises,
    ...Object.entries(mudConfig.systems).map(
      async ([systemName, { fileSelector, openAccess, registerFunctionSelectors }]) => {
        // Register system at route
        console.log(chalk.blue(`Registering system ${systemName} at ${namespace}/${fileSelector}`));
        await fastTxExecute(WorldContract, "registerSystem", [
          toBytes16(namespace),
          toBytes16(fileSelector),
          await contractPromises[systemName],
          openAccess,
        ]);
        console.log(chalk.green(`Registered system ${systemName} at ${namespace}/${fileSelector}`));

        // Register function selectors for the system
        if (registerFunctionSelectors) {
          const functionSignatures: FunctionSignature[] = await loadFunctionSignatures(systemName);
          const isRoot = namespace === "";
          // Using Promise.all to avoid blocking on async calls
          await Promise.all(
            functionSignatures.map(async ({ functionName, functionArgs }) => {
              const functionSignature = isRoot
                ? functionName + functionArgs
                : `${namespace}_${fileSelector}_${functionName}${functionArgs}`;

              console.log(chalk.blue(`Registering function "${functionSignature}"`));
              if (isRoot) {
                const worldFunctionSelector = toFunctionSelector(
                  functionSignature === ""
                    ? { functionName: systemName, functionArgs } // Register the system's fallback function as `<systemName>(<args>)`
                    : { functionName, functionArgs }
                );
                const systemFunctionSelector = toFunctionSelector({ functionName, functionArgs });
                await fastTxExecute(WorldContract, "registerRootFunctionSelector", [
                  toBytes16(namespace),
                  toBytes16(fileSelector),
                  worldFunctionSelector,
                  systemFunctionSelector,
                ]);
              } else {
                await fastTxExecute(WorldContract, "registerFunctionSelector", [
                  toBytes16(namespace),
                  toBytes16(fileSelector),
                  functionName,
                  functionArgs,
                ]);
              }
              console.log(chalk.green(`Registered function "${functionSignature}"`));
            })
          );
        }
      }
    ),
  ];

  // Wait for resources to be registered before granting access to them
  await Promise.all(promises); // ----------------------------------------------------------------------------------------------
  promises = [];

  // Grant access to systems
  for (const [systemName, { fileSelector, accessListAddresses, accessListSystems }] of Object.entries(
    mudConfig.systems
  )) {
    const resourceSelector = `${namespace}/${fileSelector}`;

    // Grant access to addresses
    promises = [
      ...promises,
      ...accessListAddresses.map(async (address) => {
        console.log(chalk.blue(`Grant ${address} access to ${systemName} (${resourceSelector})`));
        await fastTxExecute(WorldContract, "grantAccess(bytes16,bytes16,address)", [
          toBytes16(namespace),
          toBytes16(fileSelector),
          address,
        ]);
        console.log(chalk.green(`Granted ${address} access to ${systemName} (${namespace}/${fileSelector})`));
      }),
    ];

    // Grant access to other systems
    promises = [
      ...promises,
      ...accessListSystems.map(async (granteeSystem) => {
        console.log(chalk.blue(`Grant ${granteeSystem} access to ${systemName} (${resourceSelector})`));
        await fastTxExecute(WorldContract, "grantAccess(bytes16,bytes16,address)", [
          toBytes16(namespace),
          toBytes16(fileSelector),
          await contractPromises[granteeSystem],
        ]);
        console.log(chalk.green(`Granted ${granteeSystem} access to ${systemName} (${resourceSelector})`));
      }),
    ];
  }

  // Wait for access to be granted before installing modules
  await Promise.all(promises); // ----------------------------------------------------------------------------------------------
  promises = [];

  // Install modules
  promises = [
    ...promises,
    ...mudConfig.modules.map(async (module) => {
      console.log(chalk.blue(`Installing${module.root ? " root " : " "}module ${module.name}`));
      // Resolve arguments
      const resolvedArgs = await Promise.all(
        module.args.map((arg) => resolveWithContext(arg, { tableIds, systemAddresses: contractPromises }))
      );
      const values = resolvedArgs.map((arg) => arg.value);
      const types = resolvedArgs.map((arg) => arg.type);
      const moduleAddress = await contractPromises[module.name];
      if (!moduleAddress) throw new Error(`Module ${module.name} not found`);

      // Send transaction to install module
      await fastTxExecute(WorldContract, module.root ? "installRootModule" : "installModule", [
        moduleAddress,
        abi.encode(types, values),
      ]);

      console.log(chalk.green(`Installed${module.root ? " root " : " "}module ${module.name}`));
    }),
  ];

  // Await all promises before executing PostDeploy script
  await Promise.all(promises); // ----------------------------------------------------------------------------------------------
  promises = [];

  // Execute postDeploy forge script
  const postDeployPath = path.join(await getScriptDirectory(), postDeployScript + ".s.sol");
  if (existsSync(postDeployPath)) {
    console.log(chalk.blue(`Executing post deploy script at ${postDeployPath}`));
    await forge(
      [
        "script",
        postDeployScript,
        "--sig",
        "run(address)",
        await contractPromises.World,
        "--broadcast",
        "--rpc-url",
        rpc,
        "-vvv",
      ],
      {
        profile,
      }
    );
  } else {
    console.log(`No script at ${postDeployPath}, skipping post deploy hook`);
  }

  console.log(chalk.green("Deployment completed in", (Date.now() - startTime) / 1000, "seconds"));

  return { worldAddress: await contractPromises.World, blockNumber };

  // ------------------- INTERNAL FUNCTIONS -------------------
  // (Inlined to avoid having to pass around nonce, signer and forgeOutDir)

  /**
   * Deploy a contract and return the address
   * @param contractName Name of the contract to deploy (must exist in the file system)
   * @returns Address of the deployed contract
   */
  async function deployContractByName(contractName: string): Promise<string> {
    console.log(chalk.blue("Deploying", contractName));

    const { abi, bytecode } = await getContractData(contractName);
    return deployContract(abi, bytecode, contractName);
  }

  /**
   * Deploy a contract and return the address
   * @param abi The contract interface
   * @param bytecode The contract bytecode
   * @param contractName The contract name (optional, used for logs)
   * @returns Address of the deployed contract
   */
  async function deployContract(
    abi: ContractInterface,
    bytecode: string | { object: string },
    contractName?: string,
    retryCount = 0
  ): Promise<string> {
    try {
      const factory = new ethers.ContractFactory(abi, bytecode, signer);
      console.log(chalk.gray(`executing deployment of ${contractName} with nonce ${nonce}`));
      const deployPromise = factory.deploy({
        nonce: nonce++,
        maxPriorityFeePerGas,
        maxFeePerGas,
      });
      promises.push(deployPromise);
      const { address } = await deployPromise;

      console.log(chalk.green("Deployed", contractName, "to", address));
      return address;
    } catch (error: any) {
      if (debug) console.error(error);
      if (retryCount === 0 && error?.message.includes("transaction already imported")) {
        // If the deployment failed because the transaction was already imported,
        // retry with a higher priority fee
        setInternalFeePerGas(priorityFeeMultiplier * 1.1);
        return deployContract(abi, bytecode, contractName, retryCount++);
      } else if (error?.message.includes("invalid bytecode")) {
        throw new MUDError(
          `Error deploying ${contractName}: invalid bytecode. Note that linking of public libraries is not supported yet, make sure none of your libraries use "external" functions.`
        );
      } else if (error?.message.includes("CreateContractLimit")) {
        throw new MUDError(`Error deploying ${contractName}: CreateContractLimit exceeded.`);
      } else throw error;
    }
  }

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

        return { functionName: item.name, functionArgs: `(${item.inputs.map((arg) => arg.type).join(",")})` };
      });
  }

  /**
   * Only await gas estimation (for speed), only execute if gas estimation succeeds (for safety)
   */
  async function fastTxExecute<C extends { estimateGas: any; [key: string]: any }, F extends keyof C>(
    contract: C,
    func: F,
    args: Parameters<C[F]>,
    retryCount = 0
  ): Promise<Awaited<ReturnType<C[F]>>> {
    const functionName = `${func as string}(${args.map((arg) => `'${arg}'`).join(",")})`;
    try {
      const gasLimit = await contract.estimateGas[func].apply(null, args);
      console.log(chalk.gray(`executing transaction: ${functionName} with nonce ${nonce}`));
      const txPromise = contract[func].apply(null, [
        ...args,
        { gasLimit, nonce: nonce++, maxPriorityFeePerGas, maxFeePerGas },
      ]);
      promises.push(txPromise);
      return txPromise;
    } catch (error: any) {
      if (debug) console.error(error);
      if (retryCount === 0 && error?.message.includes("transaction already imported")) {
        // If the deployment failed because the transaction was already imported,
        // retry with a higher priority fee
        setInternalFeePerGas(priorityFeeMultiplier * 1.1);
        return fastTxExecute(contract, func, args, retryCount++);
      } else throw new MUDError(`Gas estimation error for ${functionName}: ${error?.reason}`);
    }
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

  /**
   * Set the maxFeePerGas and maxPriorityFeePerGas based on the current base fee and the given multiplier.
   * The multiplier is used to allow replacing pending transactions.
   * @param multiplier Multiplier to apply to the base fee
   */
  async function setInternalFeePerGas(multiplier: number) {
    // Compute maxFeePerGas and maxPriorityFeePerGas like ethers, but allow for a multiplier to allow replacing pending transactions
    const feeData = await provider.getFeeData();
    if (!feeData.lastBaseFeePerGas) throw new MUDError("Can not fetch lastBaseFeePerGas from RPC");

    // Set the priority fee to 0 for development chains with no base fee, to allow transactions from unfunded wallets
    maxPriorityFeePerGas = feeData.lastBaseFeePerGas.eq(0) ? 0 : Math.floor(1_500_000_000 * multiplier);
    maxFeePerGas = feeData.lastBaseFeePerGas.mul(2).add(maxPriorityFeePerGas);
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
