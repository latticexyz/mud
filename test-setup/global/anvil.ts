import { createServer } from "prool";
import { anvil } from "prool/instances";
import { anvilHost, anvilPort } from "../common";
import { execa } from "execa";

// The nightly warning from Foundry causes anvil to not start up properly.
// https://github.com/wevm/prool/issues/35
process.env.FOUNDRY_DISABLE_NIGHTLY_WARNING ??= "1";

const server = createServer({
  instance: anvil(),
  host: anvilHost,
  port: anvilPort,
});

export default async () => {
  console.log("building mock game contracts");
  await execa("pnpm", ["build"], {
    cwd: `${__dirname}/../../test/mock-game-contracts`,
    stdout: ["inherit"],
    stderr: ["inherit"],
  });

  console.log("starting anvil proxy");
  const stopServer = await server.start();

  return async () => {
    await stopServer();
  };
};
