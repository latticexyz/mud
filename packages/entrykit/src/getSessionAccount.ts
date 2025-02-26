import { Address, Chain, Client, LocalAccount, Transport } from "viem";
import { SmartAccount } from "viem/account-abstraction";
import { toSimpleSmartAccount } from "permissionless/accounts";
import { getSessionSigner } from "./getSessionSigner";

export type GetSessionAccountReturnType = {
  readonly account: SmartAccount;
  readonly signer: LocalAccount;
};

export async function getSessionAccount<chain extends Chain>({
  client,
  userAddress,
}: {
  client: Client<Transport, chain>;
  userAddress: Address;
}): Promise<GetSessionAccountReturnType> {
  const signer = getSessionSigner(userAddress);
  const account = await toSimpleSmartAccount({ client, owner: signer });
  return { account, signer };
}
