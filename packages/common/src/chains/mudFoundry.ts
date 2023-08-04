import { TransactionRequest, defineTransactionRequest } from "viem";
import { foundry, Chain } from "viem/chains";

export const mudFoundry = {
  ...foundry,
  formatters: {
    // transactionRequest: defineTransactionRequest({
    //   format(args: TransactionRequest) {
    //     // console.log("formatting transaction", args);
    //     return {
    //       maxFeePerGas: 0n,
    //       maxPriorityFeePerGas: 0n,
    //     };
    //   },
    // }),
  },
} as const satisfies Chain;
