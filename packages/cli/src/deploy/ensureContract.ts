import { Client, Transport, Chain, Account, Address, concatHex, getCreate2Address, Hex } from "viem";
import { getBytecode, sendTransaction, waitForTransactionReceipt } from "viem/actions";
import { deployer } from "./deployer";
import { salt } from "./common";

export async function ensureContract(
  client: Client<Transport, Chain | undefined, Account>,
  bytecode: Hex
): Promise<Address> {
  const address = getCreate2Address({ from: deployer, salt, bytecode });

  const contractCode = await getBytecode(client, { address });
  if (!contractCode) {
    const tx = await sendTransaction(client, {
      chain: null,
      to: deployer,
      data: concatHex([salt, bytecode]),
    });
    const receipt = await waitForTransactionReceipt(client, { hash: tx });
    if (receipt.status !== "success") {
      console.error("CREATE2 failed", receipt);
      throw new Error("CREATE2 failed");
    }
  }

  return address;
}
