import { Wallet } from "ethers";
import { Providers } from "./types";

export function createSigner(privateKey: string, providers: Providers) {
  const signer = new Wallet(privateKey);
  signer.connect(providers.ws || providers.json);
  return signer;
}
