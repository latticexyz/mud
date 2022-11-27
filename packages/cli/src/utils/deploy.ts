import { constants, Wallet } from "ethers";

// Workaround to prevent tsc to transpile dynamic imports with require, which causes an error upstream
// https://github.com/microsoft/TypeScript/issues/43329#issuecomment-922544562
const importExeca = eval('import("execa")') as Promise<typeof import("execa")>;

const contractsDir = __dirname + "/../../src/contracts";

export async function deploy(
  deployerPrivateKey?: string,
  rpc = "http://localhost:8545",
  worldAddress?: string,
  reuseComponents?: boolean
) {
  const { execa } = await importExeca;

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

  return child;
}
