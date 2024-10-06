import { startProxy as startAnvilProxy } from "@viem/anvil";
import { anvilHost, anvilPort } from "../common";
import { execa } from "execa";

export default async function globalSetup(): Promise<() => Promise<void>> {
  console.log("building mock game");
  await execa("pnpm", ["run", "build"], {
    cwd: `${__dirname}/../../test/mock-game-contracts`,
  });

  const shutdownAnvilProxy = await startAnvilProxy({
    host: anvilHost,
    port: anvilPort,
  });

  return async () => {
    await shutdownAnvilProxy();
  };
}
