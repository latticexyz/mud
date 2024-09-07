import fs from "node:fs/promises";
import path from "node:path/posix";
import { fileURLToPath } from "node:url";
import { createAnvil } from "@viem/anvil";
import { generateLogs } from "./generateLogs";

const anvil = createAnvil({
  blockTime: 1,
  blockBaseFeePerGas: 0,
  gasLimit: 20_000_000,
});

console.log("starting anvil");
await anvil.start();
const rpc = `http://${anvil.host}:${anvil.port}`;

const logs = await generateLogs(rpc, async (worldContract) => {
  console.log("calling set");
  await worldContract.write.set([[420]]);
  console.log("calling push");
  const lastTx = await worldContract.write.push([69]);

  return lastTx;
});

const logsFilename = path.join(path.dirname(fileURLToPath(import.meta.url)), `../../../test-data/world-logs.json`);

console.log("writing", logs.length, "logs to", logsFilename);
await fs.writeFile(logsFilename, JSON.stringify(logs, null, 2));

// TODO: figure out why anvil doesn't stop immediately
// console.log("stopping anvil");
// await anvil.stop();
process.exit(0);
