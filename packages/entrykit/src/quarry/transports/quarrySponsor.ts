import { Address, EIP1193RequestFn, Transport, http } from "viem";

export type QuarrySponsorRpcSchema = [
  {
    Method: "sponsor_requestAllowance";
    Parameters: [receiver: Address];
    ReturnType: { message: string };
  },
];

export function quarrySponsor(): Transport<"http", {}, EIP1193RequestFn<QuarrySponsorRpcSchema>> {
  return ({ chain }) => {
    if (!chain) throw new Error("No chain provided to quarrySponsor transport.");

    const url = "quarrySponsor" in chain.rpcUrls ? chain.rpcUrls.quarrySponsor.http[0] : undefined;
    // TODO: add fallback for anvil to do what quarrySponsor does internally
    if (!url) throw new Error(`No \`quarrySponsor\` RPC URL found for chain ${chain.id}.`);

    return http(url)({ chain, retryCount: 0 });
  };
}
