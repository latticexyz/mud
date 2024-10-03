import { bytesToHex, hashMessage } from "viem";
import { sign } from "webauthn-p256";
import { cache } from "./cache";
import { getMessageHash } from "./getMessageHash";
import { recoverPasskeyPublicKey } from "./recoverPasskeyPublicKey";
import { P256Credential } from "viem/account-abstraction";

export async function reusePasskey(): Promise<P256Credential> {
  const randomChallenge = bytesToHex(crypto.getRandomValues(new Uint8Array(256)));
  const messageHash = hashMessage(randomChallenge);
  const { signature, webauthn, raw: credential } = await sign({ hash: messageHash });

  const publicKey = await (async () => {
    const publicKey = cache.getState().publicKeys[credential.id];
    if (publicKey) return publicKey;

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
    if (passkey.credential.id !== credential.id) {
      throw new Error("wrong credential");
    }

    cache.setState((state) => ({
      publicKeys: {
        ...state.publicKeys,
        [credential.id]: passkey.publicKey,
      },
    }));

    return passkey.publicKey;
  })();

  console.log("recovered passkey", credential.id, publicKey);

  cache.setState(() => ({
    activeCredential: credential.id,
  }));

  return { id: credential.id, publicKey, raw: credential };
}
