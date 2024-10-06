import { createTestClient, http } from "viem";

export const anvilHost = process.env.ANVIL_HOST ?? "127.0.0.1";
export const anvilPort = process.env.ANVIL_PORT ?? "8556";

// ID of the current test worker. Used by the `@viem/anvil` proxy server.
export const poolId = Number(process.env.VITEST_POOL_ID ?? 1);

export const anvilRpcUrl = `http://${anvilHost}:${anvilPort}/${poolId}`;

export const testClient = createTestClient({
  mode: "anvil",
  // TODO: if tests get slow, try switching to websockets?
  transport: http(anvilRpcUrl),
  pollingInterval: 10,
});

export async function snapshotAnvilState() {
  const state = await testClient.dumpState();
  return async (): Promise<void> => {
    await testClient.loadState({ state });
  };
}
