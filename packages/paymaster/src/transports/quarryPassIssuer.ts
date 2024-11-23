import { Address, EIP1193RequestFn, Hex, Transport, http } from "viem";

export type QuarryPassIssuerRpcSchema = [
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

export function quarryPassIssuer(): Transport<"http", {}, EIP1193RequestFn<QuarryPassIssuerRpcSchema>> {
  return ({ chain }) => {
    if (!chain) throw new Error("No chain provided to issuer transport.");

    const url = "quarryPassIssuer" in chain.rpcUrls ? chain.rpcUrls.quarryPassIssuer.http[0] : undefined;
    // TODO: add fallback for anvil to do what quarryPassIssuer does internally
    if (!url) throw new Error(`No \`quarryPassIssuer\` RPC URL found for chain ${chain.id}.`);

    return http(url)({ chain, retryCount: 0 });
  };
}
