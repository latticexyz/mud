import { cache } from "./cache";
import { PasskeyCredential } from "@latticexyz/id/internal";
import { createCredential } from "webauthn-p256";

export async function createPasskey(): Promise<PasskeyCredential> {
  const credential = await createCredential({ name: "MUD Account" });
  console.log("created passkey", credential);

  cache.setState((state) => ({
    activeCredential: credential.id,
    publicKeys: {
      ...state.publicKeys,
      [credential.id]: credential.publicKey,
    },
  }));

  return {
    credentialId: credential.id,
    publicKey: credential.publicKey,
  };
}
