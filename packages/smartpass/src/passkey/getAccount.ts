import { toWebAuthnAccount, WebAuthnAccount } from "viem/account-abstraction";
import { cache } from "./cache";
import { P256Credential } from "webauthn-p256";

export async function getAccount(id: P256Credential["id"]): Promise<WebAuthnAccount> {
  const { publicKeys } = cache.getState();

  const publicKey = publicKeys[id];
  // TODO: should we prompt to recover key here?
  if (!publicKey) {
    throw new Error("No public key found for passkey credential.");
  }

  return toWebAuthnAccount({ credential: { id, publicKey } });
}
