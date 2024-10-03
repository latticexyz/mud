import { Address, Client, bytesToHex, hashMessage } from "viem";
import { sign } from "webauthn-p256";
import { cache } from "./cache";
import { getCredentialAddress } from "./getCredentialAddress";
import { getMessageHash } from "./getMessageHash";
import { recoverPasskeyPublicKey } from "./recoverPasskeyPublicKey";

export async function reusePasskey(client: Client): Promise<Address> {
  const randomChallenge = bytesToHex(crypto.getRandomValues(new Uint8Array(256)));

  const messageHash = hashMessage(randomChallenge);
  const { signature, webauthn, raw: credential } = await sign({ hash: messageHash });
  // TODO: look up account/public key by credential ID once we store it onchain

  const webauthnHash = await getMessageHash(webauthn);

  const passkey = await recoverPasskeyPublicKey({
    credentialId: credential.id,
    messageHash: webauthnHash,
    signatureHex: signature,
  });
  if (!passkey) {
    throw new Error("recovery failed");
  }

  console.log("recovered passkey", passkey);

  cache.setState((state) => ({
    activeCredential: passkey.credential.id,
    publicKeys: {
      ...state.publicKeys,
      [passkey.credential.id]: passkey.publicKey,
    },
  }));

  const address = await getCredentialAddress(client, passkey.credential.id);
  return address;
}
