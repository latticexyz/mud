import { Hex } from "ox";

export type SmartPassCredential = {
  credentialId: string;
  publicKey: Hex.Hex;
};
