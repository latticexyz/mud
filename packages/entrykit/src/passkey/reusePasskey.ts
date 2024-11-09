import { bytesToHex, hashMessage } from "viem";
import { cache } from "./cache";
import { getMessageHash } from "./getMessageHash";
import { findPublicKey } from "./findPublicKey";
import { PasskeyCredential } from "@latticexyz/id/internal";
import { sign } from "webauthn-p256";

export async function reusePasskey(): Promise<PasskeyCredential> {
  const challenge = hashMessage(bytesToHex(crypto.getRandomValues(new Uint8Array(256))));
  const {
    raw: { id: credentialId },
    signature,
    webauthn: metadata,
  } = await sign({ hash: challenge });

  const publicKey = await (async () => {
    const cachedPublicKey = cache.getState().publicKeys[credentialId];
    if (cachedPublicKey) return cachedPublicKey;

    // TODO: look up account/public key by credential ID once we store it onchain

    const messageHash = await getMessageHash(metadata);
    const challenge2 = hashMessage(signature);
    const signature2 = await sign({ credentialId, hash: challenge2 });
    if (signature2.raw.id !== credentialId) {
      throw new Error("wrong credential");
    }

    const publicKey = findPublicKey([
      { messageHash, signatureHex: signature },
      { messageHash: await getMessageHash(signature2.webauthn), signatureHex: signature2.signature },
    ]);
    if (!publicKey) {
      throw new Error("recovery failed");
    }

    cache.setState((state) => ({
      publicKeys: {
        ...state.publicKeys,
        [credentialId]: publicKey,
      },
    }));

    return publicKey;
  })();

  console.log("recovered passkey", credentialId, publicKey);

  cache.setState(() => ({
    activeCredential: credentialId,
  }));

  return { credentialId, publicKey };
}
