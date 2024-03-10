import { Hex } from "viem";
import { getTransactionReceipt } from "viem/actions";
import { testClient } from "../../../test/common";

export async function waitForTransaction(hash: Hex): Promise<void> {
  console.log("txpool", await testClient.getTxpoolContent());
  await testClient.mine({ blocks: 1 });
  const receipt = await getTransactionReceipt(testClient, { hash });
  if (receipt.status === "reverted") {
    // TODO: better error
    throw new Error(`Transaction reverted (${hash})`);
  }
}
