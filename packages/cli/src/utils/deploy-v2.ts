import { execa } from "execa";
import { readFileSync } from "fs";
import path from "path";
import { MUDConfig } from "../config/index.js";
import { MUDError } from "./errors.js";
import { cast, forge } from "./foundry.js";
import { getOutDirectory } from "./forgeConfig.js";
import { ethers } from "ethers";
import { World } from "@latticexyz/world/types/ethers-contracts/World.js";
import { abi as WorldABI } from "@latticexyz/world/abi/World.json";
import { ArgumentsType } from "vitest";
import chalk from "chalk";
import { SchemaType } from "@latticexyz/schema-type";

export interface DeployConfig {
  rpc: string;
  privateKey: string;
}

// function loadContractData(src: string): { bytecode: string; abi: ContractInterface } {
//   let data: any;
//   try {
//     data = JSON.parse(readFileSync(src, "utf8"));
//   } catch (error: any) {
//     throw new MUDError(`Error reading file at ${src}: ${error?.message}`);
//   }

//   const bytecode = data?.bytecode?.object;
//   if (!bytecode) throw new MUDError(`No bytecode found in ${src}`);

//   const abi = data?.abi;
//   if (!abi) throw new MUDError(`No ABI found in ${src}`);

//   return { abi, bytecode };
// }

export async function deploy(mudConfig: MUDConfig, deployConfig: DeployConfig) {
  // TODO: Deploy World (either vanilla or overridden)
  const { worldContractName, baseRoute } = mudConfig;
  const { rpc, privateKey } = deployConfig;

  const provider = new ethers.providers.StaticJsonRpcProvider(rpc);
  const signer = new ethers.Wallet(privateKey, provider);

  // Get block number before deploying
  const blockNumber = Number(await cast("block-number", "--rpc-url", rpc));
  console.log("Start deployment at block", blockNumber);

  // Deploy World contract
  const { deployedTo: worldAddress } = JSON.parse(
    await forge("create", worldContractName, "--rpc-url", rpc, "--private-key", privateKey, "--json")
  );
  console.log(chalk.green("Deployed World to", worldAddress));
  const WorldContract = new ethers.Contract(worldAddress, WorldABI, signer) as World;

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

  // Deploy systems
  for (const [systemName, systemConfig] of Object.entries(mudConfig.systems)) {
    console.log(chalk.blue("Deploying", systemName));
    const { deployedTo: systemAddress } = JSON.parse(
      await forge("create", systemName, "--rpc-url", rpc, "--private-key", privateKey, "--json")
    );
    console.log(chalk.green("Deployed", systemName, "to", systemAddress));

    // Register system route
    await registerNestedRoute(WorldContract, baseRoute, systemConfig.route, true);

    // Register system at route
    await safeTxExecute(
      WorldContract,
      "registerSystem",
      baseRoute,
      systemConfig.route,
      systemAddress,
      systemConfig.openAccess
    );
    console.log(chalk.green("Registered", systemName, "at", baseRoute + systemConfig.route));
  }

  // TODO: Grant access to systems

  // TODO: Execute postDeploy forge script
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
    console.log(chalk.gray(`executing transaction: ${functionName}`));
    return contract[func].apply(null, [...args, { gasLimit }]);
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

function encodeSchema(schema: Record<string, SchemaType>) {
  console.log("TODO");
  console.log(schema);
  return "";
}
