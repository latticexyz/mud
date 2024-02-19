import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getLogs } from "./getLogs";

const WORLD_ADDRESS = "0x7203e7adfdf38519e1ff4f8da7dcdc969371f377";
const FROM_BLOCK = 0;
const TO_BLOCK = 896500;

const logs = await getLogs(WORLD_ADDRESS, FROM_BLOCK, TO_BLOCK);

const logsFilename = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  `../../../test-data/world-logs-skystrife.json`
);

console.log("writing", logs.length, "logs to", logsFilename);
await fs.writeFile(logsFilename, JSON.stringify(logs, null, 2));
