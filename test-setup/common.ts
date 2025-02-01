import { createTestClient, http } from "viem";
import path from "path";

export function getAnvilRpcUrl() {
  const rpcUrl = process.env.PROOL_ANVIL_URL
    ? `${process.env.PROOL_ANVIL_URL}/${Math.floor(Math.random() * 100000)}`
    : "http://127.0.0.1:8545";

  if (!process.env.PROOL_ANVIL_URL) {
    console.warn(`
      A test asked for the Anvil RPC URL, but was run outside of our test wrapper that manages Anvil instances.

      Anvil RPC URL is defaulting to "${rpcUrl}".

      You can either start an Anvil server or prefix your command:

        ${path.relative(process.cwd(), `${__dirname}/../withAnvil.ts`)} ${process.env.npm_lifecycle_script || "vitest ..."}

    `);
  }

  return rpcUrl;
}

export function getTestClient() {
  return createTestClient({
    mode: "anvil",
    transport: http(getAnvilRpcUrl()),
    pollingInterval: 10,
  });
}

export async function snapshotAnvilState() {
  const testClient = getTestClient();
  const state = await testClient.dumpState();
  return async (): Promise<void> => {
    await testClient.loadState({ state });
  };
}
