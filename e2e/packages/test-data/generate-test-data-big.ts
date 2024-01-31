import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { startProxy } from "@viem/anvil";
import { generateLogs } from "./generateLogs";

const COUNTS = [10, 100, 1000];

console.log("starting proxy");
await startProxy({
  options: {
    blockTime: 1,
    blockBaseFeePerGas: 0,
    gasLimit: 20_000_000,
  },
});

for (let i = 0; i < COUNTS.length; i++) {
  const count = COUNTS[i];

  // each group of logs gets a fresh anvil instance
  const rpc = `http://127.0.0.1:8545/${count}`;

  console.log(`generating logs for ${count} records`);
  const logs = await generateLogs(count, rpc);

  const logsFilename = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    `../../../test-data/world-logs-${count}.json`
  );

  console.log("writing", logs.length, "logs to", logsFilename);
  await fs.writeFile(logsFilename, JSON.stringify(logs, null, 2));
}

// exit to kill the proxy
process.exit(0);
