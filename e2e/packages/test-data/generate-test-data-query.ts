import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createAnvil } from "@viem/anvil";
import { SystemCall, generateLogs } from "./generateLogs";

const anvil = createAnvil({
  blockTime: 1,
  blockBaseFeePerGas: 0,
  gasLimit: 20_000_000,
});

console.log("starting anvil");
await anvil.start();
const rpc = `http://${anvil.host}:${anvil.port}`;

const calls: SystemCall[] = [];
for (let i = 0; i < 100; i++) {
  calls.push({ functionName: "setNumber", args: [i, i] });
}
for (let i = 0; i < 50; i++) {
  calls.push({ functionName: "setVector", args: [i, i, i] });
}

const logs = await generateLogs(rpc, calls);

const logsFilename = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  `../../../test-data/world-logs-query.json`
);

console.log("writing", logs.length, "logs to", logsFilename);
await fs.writeFile(logsFilename, JSON.stringify(logs, null, 2));

// TODO: figure out why anvil doesn't stop immediately
// console.log("stopping anvil");
// await anvil.stop();
process.exit(0);
