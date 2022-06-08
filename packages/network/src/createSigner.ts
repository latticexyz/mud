import { Wallet } from "ethers";
import { Providers } from "./types";

export function createSigner(privateKey: string, providers: Providers) {
  return new Wallet(privateKey, providers.ws || providers.json);
}
