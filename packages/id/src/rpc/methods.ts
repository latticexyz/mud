import { PasskeyCredential } from "../common";
import { createCredential, sign, WebAuthnData, Hex } from "webauthn-p256";

export const methods = {
  async create(): Promise<PasskeyCredential> {
    const credential = await createCredential({ name: "MUD ID" });
    return {
      credentialId: credential.id,
      publicKey: credential.publicKey,
    };
  },
  async sign(params: {
    credentialId?: PasskeyCredential["credentialId"];
    challenge: Hex;
  }): Promise<{ credentialId: PasskeyCredential["credentialId"]; signature: Hex; metadata: WebAuthnData }> {
    const {
      raw: credential,
      signature,
      webauthn: metadata,
    } = await sign({ credentialId: params.credentialId, hash: params.challenge });
    return {
      credentialId: credential.id,
      signature,
      metadata,
    };
  },
};

export type methods = typeof methods;
