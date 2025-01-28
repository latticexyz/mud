import { execa } from "execa";
import { anvilRpcUrl } from "./common";
import { Hex, isHex } from "viem";
import config from "../test/mock-game-contracts/mud.config";
import worldAbi from "../test/mock-game-contracts/out/IWorld.sol/IWorld.abi.json" with { type: "json" };

export { config, worldAbi };

export async function deployMockGame(): Promise<Hex> {
  console.log("deploying mock game to", anvilRpcUrl);
  const { stdout, stderr } = await execa(
    "pnpm",
    // skip build because its slow and we do it in global setup
    // if we don't skip build here, it regenerates ABIs which cause the tests to re-run (because we import the ABI here), which re-runs this deploy...
    ["mud", "deploy", "--rpc", anvilRpcUrl, "--saveDeployment", "false", "--skipBuild"],
    {
      cwd: `${__dirname}/../test/mock-game-contracts`,
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
