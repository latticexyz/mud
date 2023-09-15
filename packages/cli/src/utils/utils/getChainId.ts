import { ethers } from "ethers";

// TODO: Use viem's getChainId
export async function getChainId(rpc: string) {
  const { result: chainId } = await ethers.utils.fetchJson(
    rpc,
    '{ "id": 42, "jsonrpc": "2.0", "method": "eth_chainId", "params": [ ] }'
  );
  return Number(chainId);
}
