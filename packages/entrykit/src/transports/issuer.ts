import { Address, EIP1193RequestFn, Hex, Transport, http } from "viem";

export type IssuerRpcSchema = [
  {
    Method: "quarry_issuePass";
    Parameters: [passId: Hex, receiver: Address];
    ReturnType: { message: string };
  },
  {
    Method: "quarry_claimAllowance";
    Parameters: [passId: Hex, receiver: Address];
    ReturnType: { message: string };
  },
];

export function issuer(): Transport<"http", {}, EIP1193RequestFn<IssuerRpcSchema>> {
  return ({ chain }) => {
    if (!chain) throw new Error("No chain provided to issuer transport.");

    const url = "issuer" in chain.rpcUrls ? chain.rpcUrls.issuer.http[0] : undefined;
    // TODO: add fallback for anvil to do what issuer does internally
    if (!url) throw new Error(`No issuer RPC URL found for chain ${chain.id}.`);

    return http(url)({ chain, retryCount: 0 });
  };
}
