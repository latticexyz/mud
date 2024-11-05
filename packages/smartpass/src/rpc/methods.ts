import { Hex } from "viem";
import { createCredential, sign } from "webauthn-p256";

export const methods = {
  async create(): Promise<{ id: string; publicKey: Hex }> {
    const credential = await createCredential({ name: "SmartPass" });
    return {
      id: credential.id,
      publicKey: credential.publicKey,
    };
  },
  async sign(params: { credentialId?: string; hash: Hex }): Promise<{ signature: Hex; credentialId: string }> {
    const { signature, raw: credential } = await sign(params);

    return { signature, credentialId: credential.id };
  },
};

export type methods = typeof methods;
