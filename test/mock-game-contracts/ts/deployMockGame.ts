import { execa } from "execa";
import { Hex, isHex } from "viem";
import config from "../mud.config";
import worldAbi from "../out/IWorld.sol/IWorld.abi.json";
import { getAnvilRpcUrl } from "with-anvil";

export { config, worldAbi };

export async function deployMockGame(): Promise<Hex> {
  console.log("deploying mock game to", getAnvilRpcUrl());
  const { stdout, stderr } = await execa(
    "pnpm",
    [
      ["mud", "deploy"],
      ["--rpc", getAnvilRpcUrl()],
      ["--saveDeployment", "false"],
      // skip build because
      // - we do it as a test dependency in turbo
      // - building regenerates ABIs which causes tests to rerun which causes another deploy
      // - race conditions with codegen files missing during build when another process needs them
      "--skipBuild",
    ].flat(),
    {
      cwd: `${__dirname}/..`,
      env: {
        // anvil default account
        PRIVATE_KEY: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
        DEBUG: "mud:*",
      },
    },
  );
  if (stderr) console.error(stderr);
  if (stdout) console.log(stdout);

  const [, worldAddress] = stdout.match(/worldAddress: '(0x[0-9a-f]+)'/i) ?? [];
  if (!isHex(worldAddress)) {
    throw new Error("world address not found in output, did the deploy fail?");
  }
  console.log("deployed mock game", worldAddress);

  return worldAddress;
}
