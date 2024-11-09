import { bytesToHex, hashMessage } from "viem";
import { cache } from "./cache";
import { getMessageHash } from "./getMessageHash";
import { findPublicKey } from "./findPublicKey";
import { PasskeyCredential, createBridge } from "@latticexyz/id/internal";
import { MUDChain } from "@latticexyz/common/chains";

export async function reusePasskey(chain: MUDChain): Promise<PasskeyCredential> {
  const bridge = await createBridge({ url: chain.mudIdUrl, message: "Signing in…" });
  try {
    const challenge = hashMessage(bytesToHex(crypto.getRandomValues(new Uint8Array(256))));
    const { credentialId, signature, metadata } = await bridge.request("sign", { challenge });

    const publicKey = await (async () => {
      const cachedPublicKey = cache.getState().publicKeys[credentialId];
      if (cachedPublicKey) return cachedPublicKey;

      // TODO: look up account/public key by credential ID once we store it onchain

      const messageHash = await getMessageHash(metadata);
      const challenge2 = hashMessage(signature);
      const signature2 = await bridge.request("sign", { credentialId, challenge: challenge2 });
      if (signature2.credentialId !== credentialId) {
        throw new Error("wrong credential");
      }

      const publicKey = findPublicKey([
        { messageHash, signatureHex: signature },
        { messageHash: await getMessageHash(signature2.metadata), signatureHex: signature2.signature },
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
  } finally {
    bridge.close();
  }
}
