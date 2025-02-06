import { existsSync } from "fs";
import path from "path";
import { getScriptDirectory } from "@latticexyz/common/foundry";
import { execa } from "execa";
import { printCommand } from "./printCommand";

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

  await printCommand(
    execa(
      "forge",
      [
        "script",
        postDeployScript,
        ["--sig", "run(address)", worldAddress],
        ["--rpc-url", rpc],
        "--broadcast",
        "-vvv",
        kms ? ["--aws"] : [],
        ...userOptions,
      ].flat(),
      {
        stdio: "inherit",
        env: {
          FOUNDRY_PROFILE: profile ?? process.env.FOUNDRY_PROFILE,
        },
      },
    ),
  );
}
