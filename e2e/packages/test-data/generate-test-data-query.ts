import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createAnvil } from "@viem/anvil";
import { mudFoundry } from "@latticexyz/common/chains";
import { privateKeyToAccount } from "viem/accounts";
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
  const account = privateKeyToAccount("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80");

  for (let i = 0; i < 100; i++) {
    await worldContract.write.setNumber([i, i], { account, chain: mudFoundry });
  }

  for (let i = 0; i < 50; i++) {
    await worldContract.write.setVector([i, i, i], { account, chain: mudFoundry });
  }

  const lastTx = await worldContract.write.set([[0]], { account, chain: mudFoundry });

  return lastTx;
});

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
