import { Address, Chain, Client, Transport } from "viem";
import { getSessionSigner } from "./getSessionSigner";
import { toCoinbaseSmartAccount } from "./smart-account/toCoinbaseSmartAccount";
import { SmartAccount } from "viem/account-abstraction";

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
