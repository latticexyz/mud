import { constants, Wallet } from "ethers";
import { generateLibDeploy, resetLibDeploy } from "./codegen";
import { findLog } from "./findLog";
import { generateTypes } from "./types";
import { execa } from "execa";

const contractsDir = __dirname + "/../../src/contracts";

export async function deploy(
  deployerPrivateKey?: string,
  rpc = "http://localhost:8545",
  worldAddress?: string,
  reuseComponents?: boolean
) {
  const address = deployerPrivateKey ? new Wallet(deployerPrivateKey).address : constants.AddressZero;

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
    ],
    { stdio: ["inherit", "pipe", "inherit"] }
  );

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
    const result = await deploy(args.deployerPrivateKey, args.rpc, args.worldAddress, Boolean(args.systems));
    deployedWorldAddress = result.deployedWorldAddress;
    initialBlockNumber = result.initialBlockNumber;

    // Extract world address from deploy script
  } catch (e) {
    console.error(e);
  } finally {
    // Remove generated LibDeploy
    console.log("Cleaning up deployment script");
    if (libDeployPath) resetLibDeploy(contractsDir);
  }

  return { deployedWorldAddress, initialBlockNumber };
}
