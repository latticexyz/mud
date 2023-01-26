import { constants, Wallet } from "ethers";
import { generateLibDeploy, resetLibDeploy } from "./codegen";
import { findLog } from "./findLog";
import { generateTypes } from "./types";
import { execa } from "execa";
import { StaticJsonRpcProvider } from "@ethersproject/providers";

const contractsDir = __dirname + "/../../src/contracts";

/**
 * Deploy world, components and systems from deploy.json
 * @param deployerPrivateKey private key of deployer
 * @param rpc rpc url
 * @param worldAddress optional, address of existing world
 * @param reuseComponents optional, reuse existing components
 * @returns address of deployed world
 */
export async function deploy(
  deployerPrivateKey?: string,
  rpc = "http://localhost:8545",
  worldAddress?: string,
  reuseComponents?: boolean,
  gasPrice?: number
) {
  const address = deployerPrivateKey ? new Wallet(deployerPrivateKey).address : constants.AddressZero;

  if (gasPrice == null) {
    try {
      console.log("Fetching gas price...");
      const provider = new StaticJsonRpcProvider(rpc, { name: "AnyNetwork", chainId: 1234 });
      gasPrice = (await provider.getGasPrice()).toNumber() * 1.3; // 30% multiplier for faster inclusion
      console.log("Gas price:", gasPrice);
    } catch (e) {
      console.log("Could not fetch gas price");
    }
  }

  const child = execa(
    "forge",
    [
      "script",
      contractsDir + "/Deploy.sol",
      "--target-contract",
      "Deploy",
      "-vvv",
      ...(!deployerPrivateKey ? [] : ["--broadcast", "--private-keys", deployerPrivateKey]),
      "--sig",
      "broadcastDeploy(address,address,bool)",
      address, // Deployer
      worldAddress || constants.AddressZero, // World address (0 = deploy a new world)
      reuseComponents ? "true" : "false", // Reuse components?
      "--fork-url",
      rpc,
      ...(gasPrice != null ? ["--with-gas-price", String(Math.round(gasPrice))] : []),
    ],
    { stdio: ["inherit", "pipe", "pipe"] }
  );

  child.stderr?.on("data", (data) => console.log("stderr:", data.toString()));
  child.stdout?.on("data", (data) => console.log(data.toString()));

  // Extract world address from deploy script
  const lines = (await child).stdout?.split("\n");
  const deployedWorldAddress = findLog(lines, "world: address");
  const initialBlockNumber = findLog(lines, "initialBlockNumber: uint256");

  return { child: await child, deployedWorldAddress, initialBlockNumber };
}

export type DeployOptions = {
  config: string;
  deployerPrivateKey?: string;
  worldAddress?: string;
  rpc: string;
  systems?: string | string[];
  clear?: boolean;
  gasPrice?: number;
};

export async function generateAndDeploy(args: DeployOptions) {
  let libDeployPath: string | undefined;
  let deployedWorldAddress: string | undefined;
  let initialBlockNumber: string | undefined;

  try {
    // Generate LibDeploy
    libDeployPath = await generateLibDeploy(args.config, contractsDir, args.systems);

    // Build and generate fresh types
    await generateTypes(undefined, "./types", { clear: args.clear });

    // Call deploy script
    const result = await deploy(
      args.deployerPrivateKey,
      args.rpc,
      args.worldAddress,
      Boolean(args.systems),
      args.gasPrice
    );
    deployedWorldAddress = result.deployedWorldAddress;
    initialBlockNumber = result.initialBlockNumber;

    // Extract world address from deploy script
  } catch (e) {
    console.error(e);
  } finally {
    // Remove generated LibDeploy
    console.log("Cleaning up deployment script");
    if (libDeployPath) await resetLibDeploy(contractsDir);
  }

  return { deployedWorldAddress, initialBlockNumber };
}
