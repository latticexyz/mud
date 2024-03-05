import { execa } from "execa";
import { anvilRpcUrl, testClient } from "./common";
import mudConfig from "mock-game-contracts/mud.config";
import { resolveConfig } from "@latticexyz/store";

export const config = resolveConfig(mudConfig);

export async function deployMockGame(): Promise<void> {
  const automine = await testClient.getAutomine();

  if (!automine) {
    console.log("turning on automine for deploy");
    await testClient.setAutomine(true);
  }

  // TODO: build in globalSetup so we don't have to build here?
  console.log("deploying mud");
  const { stdout, stderr } = await execa("pnpm", ["mud", "deploy", "--rpc", anvilRpcUrl, "--saveDeployment", "false"], {
    cwd: `${__dirname}/../../../test/mock-game-contracts`,
    env: {
      // anvil default account
      PRIVATE_KEY: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
      DEBUG: "mud:*",
    },
  });
  if (stderr) console.error(stderr);
  if (stdout) console.log(stdout);

  if (!automine) {
    console.log("turning off automine");
    await testClient.setAutomine(false);
  }
}
