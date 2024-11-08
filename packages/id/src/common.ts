import { Hex } from "ox";

export type PasskeyCredential = {
  credentialId: string;
  publicKey: Hex.Hex;
};
