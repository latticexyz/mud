import { existsSync } from "fs";
import path from "path";
import chalk from "chalk";
import { getScriptDirectory, forge } from "@latticexyz/common/foundry";

export async function postDeploy(
  postDeployScript: string,
  worldAddress: string,
  rpc: string,
  profile: string | undefined
): Promise<void> {
  // Execute postDeploy forge script
  const postDeployPath = path.join(await getScriptDirectory(), postDeployScript + ".s.sol");
  if (existsSync(postDeployPath)) {
    console.log(chalk.blue(`Executing post deploy script at ${postDeployPath}`));
    await forge(
      ["script", postDeployScript, "--sig", "run(address)", worldAddress, "--broadcast", "--rpc-url", rpc, "-vvv"],
      {
        profile: profile,
      }
    );
  } else {
    console.log(`No script at ${postDeployPath}, skipping post deploy hook`);
  }
}
