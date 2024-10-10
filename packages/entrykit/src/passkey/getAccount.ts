import { Client } from "viem";
import { toWebAuthnAccount } from "viem/account-abstraction";
import { cache } from "./cache";
import { P256Credential } from "webauthn-p256";
import { toCoinbaseSmartAccount, ToCoinbaseSmartAccountReturnType } from "../smart-account/toCoinbaseSmartAccount";
import { privateKeyToAccount } from "viem/accounts";

export async function getAccount(
  client: Client,
  id: P256Credential["id"],
  signer?: "passkey" | "initializer",
): Promise<ToCoinbaseSmartAccountReturnType> {
  const { publicKeys, initializerPrivateKey } = cache.getState();

  const publicKey = publicKeys[id];
  // TODO: should we prompt to recover key here?
  if (!publicKey) {
    throw new Error("No public key found for passkey credential.");
  }

  const passkey = toWebAuthnAccount({ credential: { id, publicKey } });
  const owners = [passkey];
  const initializer = privateKeyToAccount(initializerPrivateKey);

  return await toCoinbaseSmartAccount({
    client,
    owners,
    initializer,
    signer: signer === "initializer" ? initializer : passkey,
  });
}
