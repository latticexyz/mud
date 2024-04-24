import { startProxy as startAnvilProxy } from "@viem/anvil";
import { anvilHost, anvilPort } from "./common";

export default async function globalSetup(): Promise<() => Promise<void>> {
  const shutdownAnvilProxy = await startAnvilProxy({
    host: anvilHost,
    port: anvilPort,
  });

  return async () => {
    await shutdownAnvilProxy();
  };
}
