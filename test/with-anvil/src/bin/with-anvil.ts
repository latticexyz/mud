#!/usr/bin/env -S pnpm tsx
import { createServer } from "prool";
import { anvil } from "prool/instances";
import { ExecaError, execa } from "execa";

const command = process.argv.slice(2);
if (!command.length) {
  throw new Error("No command provided.");
}

// polyfill Promise.withResolvers for prool
// TODO: remove once we upgrade to node 22
if (typeof Promise.withResolvers === "undefined") {
  Promise.withResolvers = <T>() => {
    let resolve: (value: T | PromiseLike<T>) => void;
    let reject: (reason?: unknown) => void;
    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve: resolve!, reject: reject! };
  };
}

const host = process.env.PROOL_ANVIL_HOST || "127.0.0.1";
const port = Number(process.env.PROOL_ANVIL_PORT) || 8556;

const server = createServer({ instance: anvil(), host, port });

console.log("starting anvil proxy");
await server.start();

console.log(`running: ${command.join(" ")}`);
try {
  await execa(command[0], command.slice(1), {
    stdio: "inherit",
    env: { PROOL_ANVIL_URL: `http://${host}:${port}` },
  });
  process.exit(0);
} catch (error) {
  if (!(error instanceof ExecaError)) throw error;
  process.exit(error.exitCode ?? 1);
}
