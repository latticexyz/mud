import { Hex } from "viem";
import { waitForTransactionReceipt } from "viem/actions";
import { testClient } from "../../../test/common";

export async function waitForTransaction(hash: Hex): Promise<void> {
  await testClient.mine({ blocks: 1 });
  const receipt = await waitForTransactionReceipt(testClient, { hash });
  if (receipt.status === "reverted") {
    // TODO: better error
    throw new Error(`Transaction reverted (${hash})`);
  }
}
