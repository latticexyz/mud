import { createCredential } from "webauthn-p256";
import { cache } from "./cache";
import { P256Credential } from "viem/account-abstraction";

export async function createPasskey(): Promise<P256Credential> {
  const credential = await createCredential({ name: "MUD Account" });
  console.log("created passkey", credential);

  cache.setState((state) => ({
    activeCredential: credential.id,
    publicKeys: {
      ...state.publicKeys,
      [credential.id]: credential.publicKey,
    },
  }));

  return credential;
}
