import { startProxy as startAnvilProxy } from "@viem/anvil";
import { anvilHost, anvilPort } from "./common";
import { execa } from "execa";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("building mock game");
await execa("pnpm", ["run", "build"], {
  cwd: `${__dirname}/../test/mock-game-contracts`,
});

console.log("starting anvil proxy");
await startAnvilProxy({
  host: anvilHost,
  port: Number(anvilPort),
});

// ensure anvil dies
process.on("SIGINT", () => process.exit());
process.on("SIGTERM", () => process.exit());
process.on("SIGQUIT", () => process.exit());
