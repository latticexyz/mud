import { cache } from "./cache";
import { createBridge, PasskeyCredential } from "@latticexyz/id/internal";
import { MUDChain } from "@latticexyz/common/chains";

export async function createPasskey(chain: MUDChain): Promise<PasskeyCredential> {
  const bridge = await createBridge({ url: chain.mudIdUrl, message: "Creating account…" });
  try {
    const credential = await bridge.request("create");
    console.log("created passkey", credential);

    cache.setState((state) => ({
      activeCredential: credential.credentialId,
      publicKeys: {
        ...state.publicKeys,
        [credential.credentialId]: credential.publicKey,
      },
    }));

    return credential;
  } finally {
    bridge.close();
  }
}
