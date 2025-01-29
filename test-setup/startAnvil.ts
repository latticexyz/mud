import { createServer } from "prool";
import { anvil } from "prool/instances";
import { anvilHost, anvilPort } from "./common";

const server = createServer({ instance: anvil({ host: anvilHost, port: anvilPort }) });

console.log("starting anvil proxy");
await server.start();

// ensure anvil dies
process.on("SIGINT", () => process.exit());
process.on("SIGTERM", () => process.exit());
process.on("SIGQUIT", () => process.exit());
