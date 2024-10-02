import { Client } from "viem";
import { ToCoinbaseSmartAccountReturnType, toCoinbaseSmartAccount, toWebAuthnAccount } from "viem/account-abstraction";
import { cache } from "./cache";

export async function getAccount(client: Client): Promise<undefined | ToCoinbaseSmartAccountReturnType> {
  const id = cache.getState().activeCredential;
  if (!id) return;

  const { publicKeys, addresses } = cache.getState();

  const publicKey = publicKeys[id];
  if (!publicKey) return;

  // TODO: replace this with our own thing
  return await toCoinbaseSmartAccount({
    address: addresses[id],
    client,
    owners: [toWebAuthnAccount({ credential: { id, publicKey } })],
  });
}
