import { existsSync, readFileSync } from "fs";
import path from "path";
import { MUDConfig } from "../config/index.js";
import { MUDError } from "./errors.js";
import { getOutDirectory, getScriptDirectory, cast, forge } from "./foundry.js";
import { BigNumber, ContractInterface, ethers } from "ethers";
import { World } from "@latticexyz/world/types/ethers-contracts/World.js";
import { abi as WorldABI, bytecode as WorldBytecode } from "@latticexyz/world/abi/World.json";
import { ArgumentsType } from "vitest";
import chalk from "chalk";
import { encodeSchema } from "@latticexyz/schema-type";
import { resolveSchemaOrUserTypeSimple } from "../render-solidity/userType.js";

export interface DeployConfig {
  profile?: string;
  rpc: string;
  privateKey: string;
  priorityFeeMultiplier: number;
}

export interface DeploymentInfo {
  blockNumber: number;
  worldAddress: string;
  rpc: string;
}

export async function deploy(mudConfig: MUDConfig, deployConfig: DeployConfig): Promise<DeploymentInfo> {
  const startTime = Date.now();
  const { worldContractName, namespace, postDeployScript } = mudConfig;
  const { profile, rpc, privateKey, priorityFeeMultiplier } = deployConfig;
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
  const promises: Promise<unknown>[] = [];

  // Get block number before deploying
  const blockNumber = Number(await cast(["block-number", "--rpc-url", rpc], { profile }));
  console.log("Start deployment at block", blockNumber);

  // Deploy all contracts (World and systems)
  const contractPromises = Object.keys(mudConfig.systems).reduce<Record<string, Promise<string>>>(
    (acc, systemName) => {
      acc[systemName] = deployContractByName(systemName);
      return acc;
    },
    {
      World: worldContractName
        ? deployContractByName(worldContractName)
        : deployContract(WorldABI, WorldBytecode, "World"),
    }
  );

  // Create World contract instance from deployed address
  const WorldContract = new ethers.Contract(await contractPromises.World, WorldABI, signer) as World;

  // Register namespace
  if (namespace) await fastTxExecute(WorldContract, "registerNamespace", [toBytes16(namespace)]);

  // Register tables
  promises.push(
    ...Object.entries(mudConfig.tables).map(async ([tableName, { fileSelector, schema, primaryKeys }]) => {
      console.log(chalk.blue(`Registering table ${tableName} at ${namespace}/${fileSelector}`));

      // Register table
      const schemaTypes = Object.values(schema).map((schemaOrUserType) => {
        return resolveSchemaOrUserTypeSimple(schemaOrUserType, mudConfig.userTypes);
      });

      const keyTypes = Object.values(primaryKeys).map((schemaOrUserType) => {
        return resolveSchemaOrUserTypeSimple(schemaOrUserType, mudConfig.userTypes);
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
    })
  );

  // Register systems (using forEach instead of for..of to avoid blocking on async calls)
  promises.push(
    ...Object.entries(mudConfig.systems).map(async ([systemName, { fileSelector, openAccess }]) => {
      console.log(chalk.blue(`Registering system ${systemName} at ${namespace}/${fileSelector}`));

      // Register system at route
      await fastTxExecute(WorldContract, "registerSystem", [
        toBytes16(namespace),
        toBytes16(fileSelector),
        await contractPromises[systemName],
        openAccess,
      ]);

      console.log(chalk.green(`Registered system ${systemName} at ${namespace}/${fileSelector}`));
    })
  );

  // Wait for resources to be registered before granting access to them
  await Promise.all(promises);

  // Grant access to systems
  for (const [systemName, { fileSelector, accessListAddresses, accessListSystems }] of Object.entries(
    mudConfig.systems
  )) {
    const resourceSelector = `${namespace}/${fileSelector}`;

    // Grant access to addresses
    promises.push(
      ...accessListAddresses.map(async (address) => {
        console.log(chalk.blue(`Grant ${address} access to ${systemName} (${resourceSelector})`));
        await fastTxExecute(WorldContract, "grantAccess(bytes16,bytes16,address)", [
          toBytes16(namespace),
          toBytes16(fileSelector),
          address,
        ]);
        console.log(chalk.green(`Granted ${address} access to ${systemName} (${namespace}/${fileSelector})`));
      })
    );

    // Grant access to other systems
    promises.push(
      ...accessListSystems.map(async (granteeSystem) => {
        console.log(chalk.blue(`Grant ${granteeSystem} access to ${systemName} (${resourceSelector})`));
        await fastTxExecute(WorldContract, "grantAccess(bytes16,bytes16,address)", [
          toBytes16(namespace),
          toBytes16(fileSelector),
          await contractPromises[granteeSystem],
        ]);
        console.log(chalk.green(`Granted ${granteeSystem} access to ${systemName} (${resourceSelector})`));
      })
    );
  }

  // Await all promises
  await Promise.all(promises);

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

  return { worldAddress: await contractPromises.World, blockNumber, rpc };

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
      if (retryCount === 0 && error?.message.includes("transaction already imported")) {
        // If the deployment failed because the transaction was already imported,
        // retry with a higher priority fee
        setInternalFeePerGas(priorityFeeMultiplier * 1.1);
        return deployContract(abi, bytecode, contractName, retryCount++);
      } else if (error?.message.includes("invalid bytecode")) {
        throw new MUDError(
          `Error deploying ${contractName}: invalid bytecode. Note that linking of public libraries is not supported yet, make sure none of your libraries use "external" functions.`
        );
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

  /**
   * Only await gas estimation (for speed), only execute if gas estimation succeeds (for safety)
   */
  async function fastTxExecute<C extends { estimateGas: any; [key: string]: any }, F extends keyof C>(
    contract: C,
    func: F,
    args: ArgumentsType<C[F]>,
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
  async function getContractData(contractName: string): Promise<{ bytecode: string; abi: ContractInterface }> {
    let data: any;
    const contractDataPath = path.join(forgeOutDirectory, contractName + ".sol", contractName + ".json");
    try {
      data = JSON.parse(readFileSync(contractDataPath, "utf8"));
    } catch (error: any) {
      throw new MUDError(`Error reading file at ${contractDataPath}: ${error?.message}`);
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
