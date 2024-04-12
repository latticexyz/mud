import { Chain, Account, Client, GetChainIdReturnType, Transport, hexToNumber } from "viem";

export async function getChainId<TChain extends Chain | undefined, TAccount extends Account | undefined>(
  client: Client<Transport, TChain, TAccount>,
): Promise<GetChainIdReturnType> {
  const chainId = client.chain?.id;
  console.log("local chain id", chainId);
  return (
    client.chain?.id ??
    hexToNumber(
      await client.request({
        method: "eth_chainId",
      }),
    )
  );
}
