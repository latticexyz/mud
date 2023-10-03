import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createAnvil } from "@viem/anvil";
import { execa } from "execa";
import {
  ClientConfig,
  createPublicClient,
  createWalletClient,
  encodeEventTopics,
  http,
  isHex,
  numberToHex,
} from "viem";
import { mudFoundry } from "@latticexyz/common/chains";
import { getContract } from "@latticexyz/common";
import { storeEventsAbi } from "@latticexyz/store";
import { privateKeyToAccount } from "viem/accounts";
import IWorldAbi from "../contracts/out/IWorld.sol/IWorld.abi.json";

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

const worldContract = getContract({
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
const logs = await publicClient.request({
  method: "eth_getLogs",
  params: [
    {
      address: worldAddress,
      topics: [
        storeEventsAbi.flatMap((event) =>
          encodeEventTopics({
            abi: [event],
            eventName: event.name,
          })
        ),
      ],
      fromBlock: numberToHex(0n),
      toBlock: numberToHex(receipt.blockNumber),
    },
  ],
});

console.log("writing", logs.length, "logs to", logsFilename);
await fs.writeFile(logsFilename, JSON.stringify(logs, null, 2));

console.log("stopping anvil");
await anvil.stop();
