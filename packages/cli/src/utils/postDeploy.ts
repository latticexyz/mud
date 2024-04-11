import { existsSync } from "fs";
import path from "path";
import chalk from "chalk";
import { getScriptDirectory, forge } from "@latticexyz/common/foundry";
import { execSync } from "child_process";
import { formatEther } from "viem";

export async function postDeploy(
  postDeployScript: string,
  worldAddress: string,
  rpc: string,
  profile: string | undefined,
): Promise<void> {
  // Execute postDeploy forge script
  const postDeployPath = path.join(await getScriptDirectory(), postDeployScript + ".s.sol");
  if (existsSync(postDeployPath)) {
    const gasPriceWei = parseInt(execSync(`cast gas-price --rpc-url ${rpc}`).toString().trim());
    if (isNaN(gasPriceWei)) {
      throw new Error("Unabled to fetch gas price from RPC.");
    }
    console.log(chalk.green(`Gas price in gwei: ${formatEther(BigInt(gasPriceWei), "gwei")}`));
    console.log(chalk.blue(`Executing post deploy script at ${postDeployPath}`));
    await forge(
      [
        "script",
        "--with-gas-price",
        gasPriceWei.toString(),
        postDeployScript,
        "--sig",
        "run(address)",
        worldAddress,
        "--broadcast",
        "--rpc-url",
        rpc,
        "-vvv",
      ],
      {
        profile: profile,
      },
    );
  } else {
    console.log(`No script at ${postDeployPath}, skipping post deploy hook`);
  }
}
