import { Client } from "viem";
import { SmartAccount, toCoinbaseSmartAccount, toWebAuthnAccount } from "viem/account-abstraction";
import { cache } from "./cache";
import { P256Credential } from "webauthn-p256";
import { getInitializerAccount } from "./getInitializerAccount";

export async function getAccount(client: Client, id: P256Credential["id"]): Promise<SmartAccount> {
  const { publicKeys } = cache.getState();

  const publicKey = publicKeys[id];
  // TODO: should we prompt to recover key here?
  if (!publicKey) {
    throw new Error("No public key found for passkey credential.");
  }

  const initializer = getInitializerAccount(id, publicKey);
  const owners = [toWebAuthnAccount({ credential: { id, publicKey } }), initializer];

  return await toCoinbaseSmartAccount({
    client,
    owners,
    // populate address here so it doesn't have to be fetched repeatedly
    // TODO: simplify after https://github.com/wevm/viem/pull/2820
    address: (await toCoinbaseSmartAccount({ client, owners })).address,
  });
}
