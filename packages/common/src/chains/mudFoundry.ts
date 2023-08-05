import { defineTransactionRequest } from "viem";
import { foundry } from "viem/chains";

export const mudFoundry = {
  ...foundry,
  formatters: {
    transactionRequest: defineTransactionRequest({
      format() {
        // Temporarily override base fee for MUD's anvil config
        // TODO: remove once https://github.com/wagmi-dev/viem/pull/963 is fixed
        return {
          maxFeePerGas: 0n,
          maxPriorityFeePerGas: 0n,
        };
      },
    }),
  },
};
