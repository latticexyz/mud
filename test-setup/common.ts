import { createTestClient, http } from "viem";

export const anvilHost = process.env.ANVIL_HOST || "127.0.0.1";
export const anvilPort = Number(process.env.ANVIL_PORT) || 8556;

// We use the Vitest runner context to set up a unique Prool/Anvil URL.
// VITEST_PID comes from our vitest.config.ts so we get the global-scoped PID
// that matches the one used by global/anvil.ts to set up the server.
const vitestPid = Number(process.env.VITEST_PID) ?? 1;
const vitestPoolId = Number(process.env.VITEST_POOL_ID ?? 1);

export const anvilUrl = `http://${anvilHost}:${anvilPort}`;
export const anvilHealthcheckUrl = `${anvilUrl}/healthcheck`;
export const anvilRpcUrl = `${anvilUrl}/${vitestPid}.${vitestPoolId}`;

export const testClient = createTestClient({
  mode: "anvil",
  transport: http(anvilRpcUrl),
  pollingInterval: 10,
});

export async function snapshotAnvilState() {
  const state = await testClient.dumpState();
  return async (): Promise<void> => {
    await testClient.loadState({ state });
  };
}
