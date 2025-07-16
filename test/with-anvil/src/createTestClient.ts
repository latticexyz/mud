import { createClient, http } from "viem";
import { getAnvilRpcUrl } from "./getAnvilRpcUrl";

// TODO: pass through client options
export function createTestClient() {
  return createClient({
    transport: http(getAnvilRpcUrl()),
    pollingInterval: 10,
  }).extend(() => ({ mode: "anvil" }));
}
