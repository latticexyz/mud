import { Chain, Hex } from "viem";

export type Paymaster = {
  readonly type: "simple" | "quarry";
  readonly address: Hex;
  readonly isGasPass?: boolean;
};

export function getPaymaster(chain: Chain): Paymaster | undefined {
  const contracts = chain.contracts ?? {};

  if ("quarryPaymaster" in contracts && contracts.quarryPaymaster != null) {
    if ("address" in contracts.quarryPaymaster) {
      return {
        type: "quarry",
        address: contracts.quarryPaymaster.address,
        isGasPass: !!chain.rpcUrls.quarryPassIssuer?.http?.[0],
      };
    }
  }

  if ("paymaster" in contracts && contracts.paymaster != null) {
    if ("address" in contracts.paymaster) {
      return {
        type: "simple",
        address: contracts.paymaster.address,
      };
    }
  }
}
