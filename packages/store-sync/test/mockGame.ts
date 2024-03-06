import { execa } from "execa";
import { anvilRpcUrl, testClient } from "./common";
import mudConfig from "mock-game-contracts/mud.config";
import { resolveConfig } from "@latticexyz/store";
import { Hex, isHex } from "viem";
import worldAbi from "mock-game-contracts/out/IWorld.sol/IWorld.abi.json";

export const deprecatedConfig = mudConfig;
export const config = resolveConfig(mudConfig);
export { worldAbi };

export async function deployMockGame(): Promise<Hex> {
  const automine = await testClient.getAutomine();

  if (!automine) {
    console.log("turning on automine for deploy");
    await testClient.setAutomine(true);
  }

  console.log("deploying mock game to", anvilRpcUrl);
  const { stdout, stderr } = await execa(
    "pnpm",
    ["mud", "deploy", "--rpc", anvilRpcUrl, "--saveDeployment", "false", "--skipBuild"],
    {
      cwd: `${__dirname}/../../../test/mock-game-contracts`,
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

  if (!automine) {
    console.log("turning off automine");
    await testClient.setAutomine(false);
  }

  return worldAddress;
}

// We manually define what we need from world ABI here because deploying causes it to get regenerated, which reruns tests, which reruns deploy
// TODO: figure out a better strategy, maybe build once at the start and deploy without a rebuild?
// export const worldAbi = [
//   {
//     type: "function",
//     name: "move",
//     inputs: [
//       {
//         name: "x",
//         type: "int32",
//         internalType: "int32",
//       },
//       {
//         name: "y",
//         type: "int32",
//         internalType: "int32",
//       },
//     ],
//     outputs: [],
//     stateMutability: "nonpayable",
//   },
// ] as const;
