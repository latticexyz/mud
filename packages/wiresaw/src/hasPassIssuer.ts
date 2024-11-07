import { Chain, ChainContract } from "viem";

export function hasPassIssuer(chain: Chain) {
  const paymasterContract = chain?.contracts?.quarryPaymaster as ChainContract | undefined;
  const paymasterAddress = paymasterContract?.address;

  const passIssuerUrl = "quarryPassIssuer" in chain.rpcUrls ? chain.rpcUrls.quarryPassIssuer.http[0] : undefined;

  return paymasterAddress != null && passIssuerUrl;
}
