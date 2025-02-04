import { dumpState, loadState } from "viem/actions";
import { createTestClient } from "./createTestClient";

export async function snapshotAnvilState() {
  const testClient = createTestClient();
  const state = await dumpState(testClient);
  return async (): Promise<void> => {
    await loadState(testClient, { state });
  };
}
