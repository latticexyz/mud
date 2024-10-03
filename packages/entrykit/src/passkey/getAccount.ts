import { Client } from "viem";
import { ToCoinbaseSmartAccountReturnType, toCoinbaseSmartAccount, toWebAuthnAccount } from "viem/account-abstraction";
import { cache } from "./cache";
import { getCredentialAddress } from "./getCredentialAddress";

export async function getAccount(client: Client): Promise<undefined | ToCoinbaseSmartAccountReturnType> {
  const id = cache.getState().activeCredential;
  if (!id) return;

  const { publicKeys } = cache.getState();

  const publicKey = publicKeys[id];
  if (!publicKey) return;

  return await toCoinbaseSmartAccount({
    // populate address here so it doesn't have to be fetched repeatedly
    address: await getCredentialAddress(client, id),
    client,
    owners: [toWebAuthnAccount({ credential: { id, publicKey } })],
  });
}
