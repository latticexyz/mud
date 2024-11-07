import { Address, Chain, Client, Transport } from "viem";
import { SmartAccount } from "viem/account-abstraction";
import { toCoinbaseSmartAccount } from "@latticexyz/common/accounts";
import { getSessionSigner } from "./getSessionSigner";

export async function getSessionAccount<chain extends Chain>({
  client,
  userAddress,
}: {
  client: Client<Transport, chain>;
  userAddress: Address;
}): Promise<SmartAccount> {
  const sessionSigner = getSessionSigner(userAddress);
  return await toCoinbaseSmartAccount({ client, owners: [sessionSigner] });
}
