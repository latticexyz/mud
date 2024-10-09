import { Client } from "viem";
import { SmartAccount, toWebAuthnAccount } from "viem/account-abstraction";
import { cache } from "./cache";
import { P256Credential } from "webauthn-p256";
import { toCoinbaseSmartAccount } from "../smart-account/toCoinbaseSmartAccount";

export async function getAccount(client: Client, id: P256Credential["id"]): Promise<SmartAccount> {
  const { publicKeys } = cache.getState();

  const publicKey = publicKeys[id];
  // TODO: should we prompt to recover key here?
  if (!publicKey) {
    throw new Error("No public key found for passkey credential.");
  }

  const owners = [toWebAuthnAccount({ credential: { id, publicKey } })];

  return await toCoinbaseSmartAccount({ client, owners });
}
