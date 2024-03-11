import { createTestClient, http, publicActions, walletActions } from "viem";

export const anvilHost = "127.0.0.1";
export const anvilPort = 8555;

// ID of the current test worker. Used by the `@viem/anvil` proxy server.
export const poolId = Number(process.env.VITEST_POOL_ID ?? 1);

export const anvilRpcUrl = `http://${anvilHost}:${anvilPort}/${poolId}`;

export const testClient = createTestClient({
  mode: "anvil",
  // TODO: if tests get slow, try switching to websockets?
  transport: http(anvilRpcUrl),
  pollingInterval: 10,
})
  .extend(publicActions)
  .extend(walletActions);
