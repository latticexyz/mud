import { Client, Transport, Chain, Account, concatHex, getCreate2Address, Hex } from "viem";
import { getBytecode } from "viem/actions";
import { deployer } from "./deployer";
import { salt } from "./common";
import { sendTransaction } from "@latticexyz/common";

export async function ensureContract(
  client: Client<Transport, Chain | undefined, Account>,
  bytecode: Hex
): Promise<Hex[]> {
  const address = getCreate2Address({ from: deployer, salt, bytecode });
  console.log("create2 address", address);

  const contractCode = await getBytecode(client, { address, blockTag: "pending" });
  if (contractCode) return [];

  return [
    await sendTransaction(client, {
      chain: client.chain ?? null,
      to: deployer,
      data: concatHex([salt, bytecode]),
    }),
  ];
}
