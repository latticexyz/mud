import { startProxy as startAnvilProxy } from "@viem/anvil";
import { anvilHost, anvilPort } from "./common";

console.log("starting anvil proxy");
await startAnvilProxy({ host: anvilHost, port: anvilPort });

// ensure anvil dies
process.on("SIGINT", () => process.exit());
process.on("SIGTERM", () => process.exit());
process.on("SIGQUIT", () => process.exit());
