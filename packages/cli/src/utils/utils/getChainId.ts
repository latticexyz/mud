import { createPublicClient, http } from "viem";

export async function getChainId(rpc: string) {
  const publicClient = createPublicClient({
    transport: http(rpc),
  });
  const chainId = await publicClient.getChainId();
  return chainId;
}
