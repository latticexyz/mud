import { Hex } from "viem";

export const coinbaseSmartWalletFactory = "0x0BA5ED0c6AA8c49038F819E587E2633c4A9F428a";

export const paymaster = "0x8d8b6b8414e1e3dcfd4168561b9be6bd3bf6ec4b";

export type SignatureAndMessage = {
  signatureHex: Hex;
  messageHash: Hex;
};
