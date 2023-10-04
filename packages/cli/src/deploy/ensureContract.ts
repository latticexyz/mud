import { Client, Transport, Chain, Account, concatHex, getCreate2Address, Hex } from "viem";
import { getBytecode } from "viem/actions";
import { deployer } from "./deployer";
import { salt } from "./common";
import { sendTransaction } from "@latticexyz/common";
import { debug } from "./debug";

export async function ensureContract(
  client: Client<Transport, Chain | undefined, Account>,
  bytecode: Hex,
  label = "contract"
): Promise<Hex[]> {
  const address = getCreate2Address({ from: deployer, salt, bytecode });

  const contractCode = await getBytecode(client, { address, blockTag: "pending" });
  if (contractCode) {
    debug("found", label, "at", address);
    return [];
  }

  debug("deploying", label, "at", address);
  return [
    await sendTransaction(client, {
      chain: client.chain ?? null,
      to: deployer,
      data: concatHex([salt, bytecode]),
    }),
  ];
}
