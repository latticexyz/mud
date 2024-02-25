import { type MUDChain, mudFoundry } from "@latticexyz/common/chains";

export const supportedChains: MUDChain[] = [
  {
    ...mudFoundry,
    // This is not an actual explorer URL; however, Wagmi requires a URL here. Wagmi uses the `blockExplorers` config of this chain to determine the `blockExplorerUrls` value for `wallet_addEthereumChain`. The `blockExplorerUrls` must be either null or an array containing at least one URL; however, Wagmi exclusively employs the array format. Thus, we need to include at least one URL here.
    //
    // https://github.com/wevm/wagmi/blob/wagmi%402.5.7/packages/core/src/connectors/injected.ts#L373-L390
    // https://docs.metamask.io/wallet/reference/wallet_addethereumchain/
    blockExplorers: { default: { name: "", url: "http://localhost:3000" } },
  },
];
