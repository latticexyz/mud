import { existsSync } from "fs";
import path from "path";
import chalk from "chalk";
import { getScriptDirectory, forge } from "@latticexyz/common/foundry";
import { execSync } from "child_process";
import { formatGwei } from "viem";

export async function postDeploy(
  postDeployScript: string,
  worldAddress: string,
  rpc: string,
  profile: string | undefined,
): Promise<void> {
  const postDeployPath = path.join(await getScriptDirectory(), postDeployScript + ".s.sol");
  if (!existsSync(postDeployPath)) {
    console.log(`No script at ${postDeployPath}, skipping post deploy hook`);
    return;
  }

  // TODO: replace this with a viem call
  const gasPrice = BigInt(execSync(`cast gas-price --rpc-url ${rpc}`, { encoding: "utf-8" }).trim());

  console.log(chalk.blue(`Executing post deploy script at ${postDeployPath}`));
  console.log(chalk.blue(`  using gas price of ${formatGwei(gasPrice)} gwei`));

  await forge(
    [
      "script",
      postDeployScript,
      "--broadcast",
      "--sig",
      "run(address)",
      worldAddress,
      // TODO: also set priority fee?
      "--with-gas-price",
      gasPrice.toString(),
      "--rpc-url",
      rpc,
      "-vvv",
    ],
    {
      profile: profile,
    },
  );
}
