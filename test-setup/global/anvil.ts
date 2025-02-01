import { createServer } from "prool";
import { anvil } from "prool/instances";
import { execa } from "execa";
import lockfile from "proper-lockfile";
import waitOn from "wait-on";
import { anvilHealthcheckUrl, anvilHost, anvilPort } from "../common";

export default async function setup() {
  const releaseLock = await lockfile.lock(__filename).catch(() => null);

  // If there's already a lock, another process must have started the global setup.
  if (!releaseLock) {
    console.log("already locked, maybe the server is running?", anvilHealthcheckUrl);
    await waitOn({ resources: [anvilHealthcheckUrl] });
    return async () => {};
  }

  console.log("LOCKING");
  console.log("LOCKING", anvilHealthcheckUrl);
  console.log("LOCKING");

  console.log("building mock game contracts");
  // await execa("pnpm", ["build"], {
  //   cwd: `${__dirname}/../../test/mock-game-contracts`,
  //   stdout: ["inherit"],
  //   stderr: ["inherit"],
  // });
  await execa("pnpm", ["turbo", "mock-game-contracts#build"], {
    stdout: ["inherit"],
    stderr: ["inherit"],
  });

  const server = createServer({
    instance: anvil(),
    host: anvilHost,
    port: anvilPort,
  });

  console.log("starting anvil proxy");
  const stopServer = await server.start();

  return async () => {
    await stopServer();
    await releaseLock();
  };
}
