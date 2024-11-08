import { WebAuthnP256, PublicKey, Signature, Hex } from "ox";
import { PasskeyCredential } from "../common";
import { SignMetadata } from "ox/WebAuthnP256";

export const methods = {
  async create(): Promise<PasskeyCredential> {
    const credential = await WebAuthnP256.createCredential({ name: "MUD ID" });
    return {
      credentialId: credential.id,
      publicKey: PublicKey.toHex(credential.publicKey),
    };
  },
  async sign(params: {
    credentialId?: PasskeyCredential["credentialId"];
    challenge: Hex.Hex;
  }): Promise<{ credentialId: PasskeyCredential["credentialId"]; signature: Hex.Hex; metadata: SignMetadata }> {
    const { raw: credential, signature, metadata } = await WebAuthnP256.sign(params);
    return {
      credentialId: credential.id,
      signature: Signature.toHex(signature),
      metadata,
    };
  },
};

export type methods = typeof methods;
