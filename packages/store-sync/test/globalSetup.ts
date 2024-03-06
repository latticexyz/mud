import { startProxy as startAnvilProxy } from "@viem/anvil";
import { anvilHost, anvilPort } from "./common";

export default async function globalSetup(): Promise<() => Promise<void>> {
  const shutdownAnvilProxy = await startAnvilProxy({
    host: anvilHost,
    port: anvilPort,
    options: {
      noMining: true,
    },
  });

  return async () => {
    await shutdownAnvilProxy();
  };
}
