import { Hex } from "webauthn-p256";

export type PasskeyCredential = {
  credentialId: string;
  publicKey: Hex;
};
