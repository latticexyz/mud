import { Hex } from "viem";
import { getTransactionReceipt } from "viem/actions";
import { minePending } from "./minePending";
import { createTestClient } from "with-anvil";

export async function waitForTransaction(hash: Hex): Promise<void> {
  await minePending();
  const receipt = await getTransactionReceipt(createTestClient(), { hash });
  if (receipt.status === "reverted") {
    // TODO: better error
    throw new Error(`Transaction reverted (${hash})`);
  }
}
