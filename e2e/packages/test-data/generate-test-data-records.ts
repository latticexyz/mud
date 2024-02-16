import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { startProxy } from "@viem/anvil";
import { generateLogs } from "./generateLogs";
import { privateKeyToAccount } from "viem/accounts";

const NUM_RECORDS = [10, 100, 1000];

console.log("starting proxy");
await startProxy({
  options: {
    blockTime: 1,
    blockBaseFeePerGas: 0,
    gasLimit: 20_000_000,
  },
});

for (let i = 0; i < NUM_RECORDS.length; i++) {
  const numRecords = NUM_RECORDS[i];

  // each group of logs gets a fresh anvil instance
  const rpc = `http://127.0.0.1:8545/${numRecords}`;

  console.log(`generating logs for ${numRecords} records`);
  const logs = await generateLogs(rpc, async (worldContract) => {
    const account = privateKeyToAccount("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80");

    console.log("calling setNumber");
    for (let i = 0; i < numRecords - 1; i++) {
      await worldContract.write.setNumber([i, i], { account });
    }

    const lastTx = await worldContract.write.setNumber([numRecords - 1, numRecords - 1], {
      account,
    });
    return lastTx;
  });

  const logsFilename = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    `../../../test-data/world-logs-${numRecords}.json`
  );

  console.log("writing", logs.length, "logs to", logsFilename);
  await fs.writeFile(logsFilename, JSON.stringify(logs, null, 2));
}

// exit to kill the proxy
process.exit(0);
