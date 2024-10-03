import { Address, Client } from "viem";
import { createCredential } from "webauthn-p256";
import { cache } from "./cache";
import { getCredentialAddress } from "./getCredentialAddress";

export async function createPasskey(client: Client): Promise<Address> {
  const credential = await createCredential({ name: "MUD Account" });
  console.log("created passkey", credential);

  cache.setState((state) => ({
    activeCredential: credential.id,
    publicKeys: {
      ...state.publicKeys,
      [credential.id]: credential.publicKey,
    },
  }));

  const address = await getCredentialAddress(client, credential.id);
  return address;
}
