import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createAnvil } from "@viem/anvil";
import { execa } from "execa";
import { ClientConfig, createPublicClient, createWalletClient, http, isHex } from "viem";
import { mudFoundry } from "@latticexyz/common/chains";
import { createContract } from "@latticexyz/common";
import { fetchLogs } from "@latticexyz/block-logs-stream";
import { storeEventsAbi } from "@latticexyz/store";
import { privateKeyToAccount } from "viem/accounts";
import IWorldAbi from "../contracts/abi/IWorld.sol/IWorld.abi.json";
import { iteratorToArray } from "@latticexyz/common/utils";

const logsFilename = path.join(path.dirname(fileURLToPath(import.meta.url)), `../../../test-data/world-logs.json`);

const anvil = createAnvil({
  blockTime: 1,
  blockBaseFeePerGas: 0,
  gasLimit: 20_000_000,
});

console.log("starting anvil");
await anvil.start();
const rpc = `http://${anvil.host}:${anvil.port}`;

console.log("deploying world");
const { stdout, stderr } = await execa(
  "pnpm",
  ["mud", "deploy", "--rpc", rpc, "--disableTxWait", "--saveDeployment", "false"],
  {
    cwd: "../contracts",
    stdio: "pipe",
  }
);
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
const walletClient = createWalletClient({
  ...clientOptions,
  account,
});

const worldContract = createContract({
  address: worldAddress,
  abi: IWorldAbi,
  publicClient,
  walletClient,
});

console.log("calling set");
await worldContract.write.set([[420]]);
console.log("calling push");
const lastTx = await worldContract.write.push([69]);

console.log("waiting for tx");
const receipt = await publicClient.waitForTransactionReceipt({ hash: lastTx });

console.log("fetching logs", receipt.blockNumber);
const logs = (
  await iteratorToArray(
    fetchLogs({
      publicClient,
      address: worldAddress,
      events: storeEventsAbi,
      fromBlock: 0n,
      toBlock: receipt.blockNumber,
    })
  )
).flatMap((range) => range.logs);

console.log("writing logs to", logsFilename);
await fs.writeFile(
  logsFilename,
  JSON.stringify(logs, (k, v) => (typeof v === "bigint" ? v.toString() : v), 2)
);

console.log("stopping anvil");
await anvil.stop();
