import { createAnvil } from "@viem/anvil";
import { execa } from "execa";
import { ClientConfig, createPublicClient, http, isHex, BaseError, ContractFunctionRevertedError } from "viem";
import { mudFoundry } from "@latticexyz/common/chains";
import { hexToResource } from "@latticexyz/common";
import { privateKeyToAccount } from "viem/accounts";
import { syncToZustand } from "@latticexyz/store-sync/zustand";
import mudConfig from "../contracts/mud.config";
import { sleep } from "@latticexyz/utils";
import IBaseWorldAbi from "@latticexyz/world/out/IBaseWorld.sol/IBaseWorld.abi.json";

async function testCallContext() {
  const anvil = createAnvil({
    blockTime: 1,
    blockBaseFeePerGas: 0,
    gasLimit: 20_000_000,
  });

  console.log("starting anvil");
  await anvil.start();
  const rpc = `http://${anvil.host}:${anvil.port}`;

  console.log("deploying world");
  const { stdout, stderr } = await execa("pnpm", ["mud", "deploy", "--rpc", rpc, "--saveDeployment", "false"], {
    cwd: "../contracts",
    stdio: "pipe",
    env: {
      DEBUG: "mud:*",
    },
  });
  if (stderr) console.error(stderr);
  if (stdout) console.log(stdout);

  const [, worldAddress] = stdout.match(/worldAddress: '(0x[0-9a-f]+)'/i) ?? [];
  if (!isHex(worldAddress)) {
    throw new Error("world address not found in output, did the deploy fail?");
  }
  console.log("got world address", worldAddress);

  const clientOptions = {
    chain: mudFoundry,
    transport: http(rpc),
    pollingInterval: 1000,
  } as const satisfies ClientConfig;

  const publicClient = createPublicClient(clientOptions);

  // anvil default private key
  const account = privateKeyToAccount("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80");

  const { useStore, tables } = await syncToZustand({
    config: mudConfig,
    address: worldAddress,
    publicClient,
  });

  // wait to sync
  await sleep(1000);

  const systems = useStore.getState().getRecords(tables.Systems);

  const batchCallSystem = Object.values(systems).find(
    (record) => hexToResource(record.key.systemId).name === "BatchCall"
  );

  if (batchCallSystem) {
    const { system } = batchCallSystem.value;

    const functionNames = ["batchCall", "batchCallFrom"] as const;

    for (let i = 0; i < functionNames.length; i++) {
      const functionName = functionNames[i];

      try {
        await publicClient.simulateContract({
          address: system,
          abi: [
            ...IBaseWorldAbi,
            {
              type: "error",
              name: "UnauthorizedCallContext",
              inputs: [],
            },
          ],
          functionName,
          account,
          args: [[]],
        });
      } catch (err) {
        if (err instanceof BaseError) {
          const revertError = err.walk((err) => err instanceof ContractFunctionRevertedError);
          if (revertError instanceof ContractFunctionRevertedError) {
            const errorName = revertError.data?.errorName ?? "";
            // Error name should be `UnauthorizedCallContext`
            console.log(errorName);
          }
        }
      }
    }
  }

  process.exit(0);
}

testCallContext();
