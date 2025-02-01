import { createTestClient, http } from "viem";
import { getAnvilRpcUrl } from "with-anvil";

export { getAnvilRpcUrl };

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
