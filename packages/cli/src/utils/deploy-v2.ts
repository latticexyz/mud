import { existsSync, readFileSync } from "fs";
import path from "path";
import { MUDConfig } from "../config/index.js";
import { MUDError } from "./errors.js";
import { getOutDirectory, getScriptDirectory, cast, forge } from "./foundry.js";
import { ContractInterface, ethers } from "ethers";
import { World } from "@latticexyz/world/types/ethers-contracts/World.js";
import { abi as WorldABI } from "@latticexyz/world/abi/World.json";
import { ArgumentsType } from "vitest";
import chalk from "chalk";
import { encodeSchema } from "@latticexyz/schema-type";

export interface DeployConfig {
  profile?: string;
  rpc: string;
  privateKey: string;
}

export interface DeploymentInfo {
  blockNumber: number;
  worldAddress: string;
  rpc: string;
}

export async function deploy(mudConfig: MUDConfig, deployConfig: DeployConfig): Promise<DeploymentInfo> {
  const startTime = Date.now();
  const { worldContractName, baseRoute, postDeployScript } = mudConfig;
  const { profile, rpc, privateKey } = deployConfig;
  const forgeOutDirectory = await getOutDirectory(profile);

  // Set up signer for deployment
  const provider = new ethers.providers.StaticJsonRpcProvider(rpc);
  const signer = new ethers.Wallet(privateKey, provider);
  const globalNonce = { nonce: await signer.getTransactionCount() };
  console.log("Initial nonce", globalNonce.nonce);

  // Catch all to await any promises before exiting the script
  const promises: Promise<unknown>[] = [];

  // Get block number before deploying
  const blockNumber = Number(await cast(["block-number", "--rpc-url", rpc], { profile }));
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
  promises.push(
    ...Object.entries(mudConfig.tables).map(async ([tableName, tableConfig]) => {
      console.log(chalk.blue("Registering table", tableName, "at", baseRoute + tableConfig.route));

      // Register nested route
      const routeFragments = tableConfig.route.substring(1).split("/"); // Split route into fragments (skip leading slash)
      const lastRouteFragment = toRoute(routeFragments.pop()); // Register last fragment separately as part of call to registerTable
      await registerNestedRoute(WorldContract, baseRoute, routeFragments);

      // Register table
      const tableBaseRoute = toRoute(baseRoute, ...routeFragments);
      await safeTxExecute(
        WorldContract,
        "registerTable",
        tableBaseRoute,
        lastRouteFragment,
        encodeSchema(Object.values(tableConfig.schema))
      );

      // Register table metadata
      await safeTxExecute(
        WorldContract,
        "setMetadata(string,string,string[])",
        baseRoute + tableConfig.route,
        tableName,
        Object.keys(tableConfig.schema)
      );

      console.log(chalk.green("Registered table", tableName, "at", baseRoute + tableConfig.route));
    })
  );

  // Register systems (using forEach instead of for..of to avoid blocking on async calls)
  promises.push(
    ...Object.entries(mudConfig.systems).map(async ([systemName, systemConfig]) => {
      console.log(chalk.blue("Registering system", systemName, "at", baseRoute + systemConfig.route));

      // Register system route
      const routeFragments = systemConfig.route.substring(1).split("/"); // Split route into fragments (skip leading slash)
      const lastRouteFragment = toRoute(routeFragments.pop()); // Register last fragment as part of call to registerSystem
      await registerNestedRoute(WorldContract, baseRoute, routeFragments);

      // Register system at route
      await safeTxExecute(
        WorldContract,
        "registerSystem",
        baseRoute,
        lastRouteFragment,
        await contractPromises[systemName],
        systemConfig.openAccess
      );

      console.log(chalk.green("Registered system", systemName, "at", baseRoute + systemConfig.route));
    })
  );

  // Wait for routes to be registered before granting access to them
  await Promise.all(promises);

  // Grant access to systems
  for (const [systemName, systemConfig] of Object.entries(mudConfig.systems)) {
    const systemRoute = baseRoute + systemConfig.route;

    // Grant access to addresses
    promises.push(
      ...systemConfig.accessListAddresses.map(async (address) => {
        console.log(chalk.blue(`Grant ${address} access to ${systemName} (${systemRoute})`));
        await safeTxExecute(WorldContract, "grantAccess", systemRoute, address);
        console.log(chalk.green(`Granted ${address} access to ${systemName} (${systemRoute})`));
      })
    );

    // Grant access to other systems
    promises.push(
      ...systemConfig.accessListSystems.map(async (granteeSystem) => {
        console.log(chalk.blue(`Grant ${granteeSystem} access to ${systemName} (${systemRoute})`));
        await safeTxExecute(WorldContract, "grantAccess", systemRoute, await contractPromises[granteeSystem]);
        console.log(chalk.green(`Granted ${granteeSystem} access to ${systemName} (${systemRoute})`));
      })
    );
  }

  // Await all promises
  await Promise.all(promises);

  // Execute postDeploy forge script
  const postDeployPath = path.join(await getScriptDirectory(), postDeployScript + ".s.sol");
  if (existsSync(postDeployPath)) {
    console.log(chalk.blue(`Executing post deploy script at ${postDeployPath}`));
    console.log(
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
        ],
        {
          profile,
        }
      )
    );
  } else {
    console.log(`No script at ${postDeployPath}, skipping post deploy hook`);
  }

  console.log(chalk.green("Deployment completed in", (Date.now() - startTime) / 1000, "seconds"));

  return { worldAddress: await contractPromises.World, blockNumber, rpc };

  // ------------------- INTERNAL FUNCTIONS -------------------
  // (Inlined to avoid having to pass around globalNonce, signer and forgeOutDir)

  /**
   * Deploy a contract and return the address
   * @param contractName Name of the contract to deploy (must exist in the file system)
   * @returns Address of the deployed contract
   */
  async function deployContract(contractName: string): Promise<string> {
    console.log(chalk.blue("Deploying", contractName));

    // Alternatively to ethers we could use forge to deploy the contract, but it seems to be
    // slightly slower (probably due to the extra overhead spawning a child process to run forge).
    // It would also require us to specify the private key as a command line argument.
    //
    // const { deployedTo } = JSON.parse(
    //   await forge(
    //     "create",
    //     contractName,
    //     "--rpc-url",
    //     rpc,
    //     "--private-key",
    //     privateKey,
    //     "--json",
    //     "--nonce",
    //     String(globalNonce.nonce++)
    //   )
    // );
    // return deployedTo;

    const { abi, bytecode } = await getContractData(contractName);
    try {
      const factory = new ethers.ContractFactory(abi, bytecode, signer);
      console.log(chalk.gray(`executing deployment of ${contractName} with nonce ${globalNonce.nonce}`));
      const deployPromise = factory.deploy({ nonce: globalNonce.nonce++ });
      promises.push(deployPromise);
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
      promises.push(txPromise);
      return txPromise;
    } catch (error: any) {
      throw new MUDError(`Gas estimation error for ${functionName}: ${error?.reason}`);
    }
  }

  async function registerNestedRoute(WorldContract: World, baseRoute: string, registerRouteFragments: string[]) {
    // Register nested routes
    for (let i = 0; i < registerRouteFragments.length; i++) {
      const subRoute = toRoute(registerRouteFragments[i]);
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
}

function toRoute(...routeFragments: (string | undefined)[]): string {
  const route = routeFragments.filter((e) => Boolean(e)).join("/");
  return route ? `/${route}` : "";
}
