import { Chain, Client, Transport } from "viem";
import { cache } from "./cache";
import { P256Credential } from "webauthn-p256";
import { toCoinbaseSmartAccount, ToCoinbaseSmartAccountReturnType } from "@latticexyz/common/accounts";
import { toWebAuthnAccount } from "viem/account-abstraction";
import { CredentialOptions } from "./common";

export async function getAccount(
  client: Client<Transport, Chain>,
  id: P256Credential["id"],
  credentialOptions: CredentialOptions,
): Promise<ToCoinbaseSmartAccountReturnType> {
  const { publicKeys } = cache.getState();

  const publicKey = publicKeys[id];
  // TODO: should we prompt to recover key here?
  if (!publicKey) {
    throw new Error("No public key found for passkey credential.");
  }

  const passkey = toWebAuthnAccount({ credential: { id, publicKey }, rpId: credentialOptions.rp?.id });
  const owners = [passkey];

  return await toCoinbaseSmartAccount({ client, owners });
}
