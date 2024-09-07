import { existsSync } from "fs";
import path from "node:path/posix";
import chalk from "chalk";
import { getScriptDirectory, forge } from "@latticexyz/common/foundry";

export async function postDeploy(
  postDeployScript: string,
  worldAddress: string,
  rpc: string,
  profile: string | undefined,
  forgeOptions: string | undefined,
  kms: boolean,
): Promise<void> {
  // TODO: make this more robust as it is likely to fail for any args that have a space in them
  const userOptions = forgeOptions?.replaceAll("\\", "").split(" ") ?? [];
  const postDeployPath = path.join(await getScriptDirectory(), postDeployScript + ".s.sol");
  if (!existsSync(postDeployPath)) {
    console.log(`No script at ${postDeployPath}, skipping post deploy hook`);
    return;
  }

  console.log(chalk.blue(`Executing post deploy script at ${postDeployPath}`));

  await forge(
    [
      "script",
      postDeployScript,
      "--broadcast",
      "--sig",
      "run(address)",
      worldAddress,
      "--rpc-url",
      rpc,
      "-vvv",
      kms ? "--aws" : "",
      ...userOptions,
    ],
    {
      profile: profile,
    },
  );
}
