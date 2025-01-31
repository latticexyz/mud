import { Hex } from "viem";
import { getTransactionReceipt } from "viem/actions";
import { testClient } from "../../../../test-setup/common";
import { minePending } from "./minePending";

export async function waitForTransaction(hash: Hex): Promise<void> {
  await minePending();
  const receipt = await getTransactionReceipt(testClient, { hash });
  if (receipt.status === "reverted") {
    // TODO: better error
    throw new Error(`Transaction reverted (${hash})`);
  }
}
