import { useWalletClient, useAccount, useChains } from "wagmi";

// A React hook that provides an external wallet client that is connected to the app's chain.
export function useExternalWalletClient() {
  const { data: externalWalletClient } = useWalletClient();
  const { chainId } = useAccount();
  const chains = useChains(); // This is the same as the `chains` in Wagmi's `createConfig({chains})`.

  if (externalWalletClient && chainId && chains.map((c) => c.id).includes(chainId)) {
    return externalWalletClient;
  }

  return undefined;
}
