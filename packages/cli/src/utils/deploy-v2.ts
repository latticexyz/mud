import { execa } from "execa";
import { existsSync, readFileSync } from "fs";
import path from "path";
import { MUDConfig } from "../config/index.js";
import { MUDError } from "./errors.js";
import { cast, forge } from "./foundry.js";
import { getOutDirectory, getScriptDirectory } from "./forgeConfig.js";
import { ContractInterface, ethers } from "ethers";
import { World } from "@latticexyz/world/types/ethers-contracts/World.js";
import { abi as WorldABI } from "@latticexyz/world/abi/World.json";
import { ArgumentsType } from "vitest";
import chalk from "chalk";
import { SchemaType } from "@latticexyz/schema-type";

export interface DeployConfig {
  rpc: string;
  privateKey: string;
}

function loadContractData(src: string): { bytecode: string; abi: ContractInterface } {
  let data: any;
  try {
    data = JSON.parse(readFileSync(src, "utf8"));
  } catch (error: any) {
    throw new MUDError(`Error reading file at ${src}: ${error?.message}`);
  }

  const bytecode = data?.bytecode?.object;
  if (!bytecode) throw new MUDError(`No bytecode found in ${src}`);

  const abi = data?.abi;
  if (!abi) throw new MUDError(`No ABI found in ${src}`);

  return { abi, bytecode };
}

export async function deploy(mudConfig: MUDConfig, deployConfig: DeployConfig) {
  const { worldContractName, baseRoute, postDeployScript } = mudConfig;
  const { rpc, privateKey } = deployConfig;
  const forgeOutDirectory = await getOutDirectory();

  // Set up signer for deployment
  const provider = new ethers.providers.StaticJsonRpcProvider(rpc);
  const signer = new ethers.Wallet(privateKey, provider);
  const globalNonce = { nonce: await signer.getTransactionCount() };
  console.log("Initial nonce", globalNonce.nonce);

  // Catch all to await any promises before exiting the script
  const txPromises: Promise<unknown>[] = [];

  // Get block number before deploying
  const blockNumber = Number(await cast("block-number", "--rpc-url", rpc));
  console.log("Start deployment at block", blockNumber);

  // Deploy all contracts (World and systems)
  const contractPromises = Object.keys(mudConfig.systems).reduce<Record<string, Promise<string>>>(
    (acc, systemName) => {
      acc[systemName] = deployContract(systemName);
      return acc;
    },
    { World: deployContract(worldContractName) }
  );

  // Create World contract instance from deployed address
  const WorldContract = new ethers.Contract(await contractPromises.World, WorldABI, signer) as World;

  // Register baseRoute
  if (baseRoute) await safeTxExecute(WorldContract, "registerRoute", "", baseRoute);

  // Register tables
  for (const [tableName, tableConfig] of Object.entries(mudConfig.tables)) {
    console.log(chalk.blue("Registering table", tableName, "at", baseRoute + tableConfig.route));
    // Register nested routes
    await registerNestedRoute(WorldContract, baseRoute, tableConfig.route);

    // TODO: Register table
    // await safeTxExecute(
    //   WorldContract,
    //   "registerTable",
    //   tableBaseRoute,
    //   tableRouteFragments[tableRouteFragments.length - 1],
    //   encodeSchema(tableConfig.schema)
    // );
  }

  // Register systems (using forEach instead of for..of to avoid blocking on async calls)
  Object.entries(mudConfig.systems).forEach(async ([systemName, systemConfig]) => {
    console.log(chalk.blue("Registering", systemName, "at", baseRoute + systemConfig.route));

    // Register system route
    await registerNestedRoute(WorldContract, baseRoute, systemConfig.route, true);

    // Register system at route
    await safeTxExecute(
      WorldContract,
      "registerSystem",
      baseRoute,
      systemConfig.route,
      await contractPromises[systemName],
      systemConfig.openAccess
    );

    console.log(chalk.green("Registered", systemName, "at", baseRoute + systemConfig.route));
  });

  // TODO: Grant access to systems

  // Await all transactions
  await Promise.all(txPromises);

  // Execute postDeploy forge script
  const postDeployPath = path.join(await getScriptDirectory(), postDeployScript + ".s.sol");
  if (existsSync(postDeployPath)) {
    console.log(chalk.blue(`Executing post deploy script "${postDeployScript}"`));
    console.log(
      await forge(
        "script",
        postDeployScript,
        "--sig",
        "run(address)",
        await contractPromises.World,
        "--rpc-url",
        rpc,
        "--private-key",
        privateKey
      )
    );
  } else {
    console.log(`No script at ${postDeployPath}, skipping post deploy hook`);
  }

  // ------------------- INTERNAL FUNCTIONS -------------------
  // (Inlined to avoid having to pass around globalNonce, signer and forgeOutDir)

  /**
   * Deploy a contract and return the address
   * @param contractName Name of the contract to deploy (must exist in the file system)
   * @returns Address of the deployed contract
   */
  async function deployContract(contractName: string): Promise<string> {
    console.log(chalk.blue("Deploying", contractName));

    // const { deployedTo } = JSON.parse(
    //   await forge("create", contractName, "--rpc-url", rpc, "--private-key", privateKey, "--json")
    // );

    const { abi, bytecode } = await getContractData(contractName);
    try {
      const factory = new ethers.ContractFactory(abi, bytecode, signer);
      console.log(chalk.gray(`executing deployment of ${contractName} with nonce ${globalNonce.nonce}`));
      const deployPromise = factory.deploy({ nonce: globalNonce.nonce++ });
      txPromises.push(deployPromise);
      const { address } = await deployPromise;

      console.log(chalk.green("Deployed", contractName, "to", address));
      return address;
    } catch (error: any) {
      if (error?.message.includes("invalid bytecode")) {
        throw new MUDError(
          `Error deploying ${contractName}: invalid bytecode. Note that linking of public libraries is not supported yet, make sure none of your libraries use "external" functions.`
        );
      } else throw error;
    }
  }

  /**
   * Only await gas estimation (for speed), only execute if gas estimation succeeds (for safety)
   */
  async function safeTxExecute<C extends { estimateGas: any; [key: string]: any }, F extends keyof C>(
    contract: C,
    func: F,
    ...args: ArgumentsType<C[F]>
  ): Promise<Awaited<ReturnType<C[F]>>> {
    const functionName = `${func as string}(${args.map((arg) => `'${arg}'`).join(",")})`;
    try {
      const gasLimit = await contract.estimateGas[func].apply(null, args);
      console.log(chalk.gray(`executing transaction: ${functionName} with nonce ${globalNonce.nonce}`));
      const txPromise = contract[func].apply(null, [...args, { gasLimit, nonce: globalNonce.nonce++ }]);
      txPromises.push(txPromise);
      return txPromise;
    } catch (error: any) {
      throw new MUDError(`Gas estimation error for ${functionName}: ${error?.reason}`);
    }
  }

  async function registerNestedRoute(
    WorldContract: World,
    baseRoute: string,
    subRoute: string,
    skipLastFragment?: boolean
  ) {
    const routeFragments = subRoute.substring(1).split("/"); // skip the leading slash

    // Register nested routes
    for (let i = skipLastFragment ? 1 : 0; i < routeFragments.length; i++) {
      const subRoute = `/${routeFragments[skipLastFragment ? i - 1 : i]}`;
      try {
        await safeTxExecute(WorldContract, "registerRoute", baseRoute, subRoute);
      } catch (e) {
        // TODO: check if the gas estimation error is due to the route already being registered and ignore it
      }
      baseRoute += subRoute;
    }
  }

  /**
   * Load the contract's abi and bytecode from the file system
   * @param contractName: Name of the contract to load
   */
  async function getContractData(contractName: string): Promise<{ bytecode: string; abi: string }> {
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
}

function encodeSchema(schema: Record<string, SchemaType>) {
  console.log("TODO");
  console.log(schema);
  return "";
}
