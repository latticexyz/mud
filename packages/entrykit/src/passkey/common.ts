import { Hex } from "viem";

export type SignatureAndMessage = {
  signatureHex: Hex;
  messageHash: Hex;
};
