import { Hex } from "viem";

export const paymaster = "0x8d8b6b8414e1e3dcfd4168561b9be6bd3bf6ec4b";

export type SignatureAndMessage = {
  signatureHex: Hex;
  messageHash: Hex;
};
