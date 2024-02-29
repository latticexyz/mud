import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createAnvil } from "@viem/anvil";
import { ClientConfig, createPublicClient, encodeEventTopics, http, isHex } from "viem";
import { mudFoundry } from "@latticexyz/common/chains";
import { execa } from "execa";
import { storeEventsAbi } from "@latticexyz/store";

const anvil = createAnvil({
  blockTime: 1,
  blockBaseFeePerGas: 0,
  gasLimit: 20_000_000,
});

console.log("starting anvil");
await anvil.start();
const rpc = `http://${anvil.host}:${anvil.port}`;

const { stdout, stderr } = await execa("pnpm", ["mud", "deploy", "--rpc", rpc, "--saveDeployment", "false"], {
  cwd: "../contracts-query-api",
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

console.log("fetching logs");
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
      fromBlock: "earliest",
      toBlock: "latest",
    },
  ],
});

const logsFilename = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  `../../../test-data/world-logs-query-api.json`
);

console.log("writing", logs.length, "logs to", logsFilename);
await fs.writeFile(logsFilename, JSON.stringify(logs, null, 2));

// TODO: figure out why anvil doesn't stop immediately
// console.log("stopping anvil");
// await anvil.stop();
process.exit(0);
