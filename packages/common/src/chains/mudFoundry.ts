import { foundry } from "viem/chains";
import { MUDChain } from "./types";

export const mudFoundry = {
  ...foundry,
  fees: {
    // This is intentionally defined as a function as a workaround for https://github.com/wagmi-dev/viem/pull/1280
    defaultPriorityFee: () => 0n,
  },
  // This is not an actual explorer URL; however, Wagmi requires a URL here.
  // Wagmi uses the `blockExplorers` config to determine the `blockExplorerUrls` value for `wallet_addEthereumChain`.
  // The `blockExplorerUrls` must be either null or an array containing at least one URL; however, Wagmi exclusively employs the array format.
  // Thus, we need to include at least one URL here.
  //
  // https://github.com/wevm/wagmi/blob/wagmi%402.5.7/packages/core/src/connectors/injected.ts#L373-L390
  // https://docs.metamask.io/wallet/reference/wallet_addethereumchain/
  blockExplorers: { default: { name: "", url: "https://example.com" } },
} as const satisfies MUDChain;
