import { dumpState, loadState } from "viem/actions";
import { createTestClient } from "./createTestClient";
import { getAnvilRpcUrl } from "./getAnvilRpcUrl";

export async function snapshotAnvilState() {
  const testClient = createTestClient();
  const rpcUrl = getAnvilRpcUrl();
  console.log("snapshotting", rpcUrl);
  const state = await dumpState(testClient);
  return async (): Promise<void> => {
    console.log("reverting to snapshot", rpcUrl);
    await loadState(testClient, { state });
  };
}
