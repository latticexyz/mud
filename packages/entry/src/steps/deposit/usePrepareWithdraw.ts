import { useQuery } from "@tanstack/react-query";
import { SendTransactionParameters, estimateFeesPerGas, getBalance, readContract } from "viem/actions";
import { getChainContractAddress, serializeTransaction } from "viem/utils";
import { AppAccountClient } from "../../common";
import { Hex } from "viem";

const withdrawGas = 21000n;

export type UsePrepareWithdrawOptions = {
  appAccountClient: AppAccountClient | undefined;
  userAddress: Hex | undefined;
};

export function usePrepareWithdraw({ appAccountClient, userAddress }: UsePrepareWithdrawOptions) {
  const queryKey = ["prepareWithdraw", appAccountClient?.chain.id, appAccountClient?.account.address, userAddress];
  return useQuery(
    appAccountClient && userAddress
      ? {
          queryKey,
          queryFn: async (): Promise<SendTransactionParameters> => {
            console.log("getting balance and fees");
            const [balance, fees] = await Promise.all([
              getBalance(appAccountClient, { address: appAccountClient.account.address }),
              estimateFeesPerGas(appAccountClient),
            ]);
            let fee = withdrawGas * fees.maxFeePerGas;

            // If this is an L2, add L1 fee
            const gasPriceOracleAddress = getChainContractAddress({
              chain: appAccountClient.chain,
              contract: "gasPriceOracle",
            });
            if (gasPriceOracleAddress) {
              const transaction = serializeTransaction({
                type: "eip1559",
                chainId: appAccountClient.chain.id,
                account: appAccountClient.account,
                to: userAddress,
                value: balance,
                gas: withdrawGas,
                ...fees,
              });

              console.log("getting L1 gas fee");
              fee += await readContract(appAccountClient, {
                address: gasPriceOracleAddress,
                abi: [
                  {
                    inputs: [{ internalType: "bytes", name: "_data", type: "bytes" }],
                    name: "getL1Fee",
                    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
                    stateMutability: "view",
                    type: "function",
                  },
                ],
                functionName: "getL1Fee",
                args: [transaction],
              });
            }

            const withdrawAmount = balance - fee;
            if (withdrawAmount <= 0n) {
              console.log("balance < withdraw fee");
              throw new Error(`Account balance (${balance}) not enough to cover estimated transfer fee (${fee}).`);
            }

            return {
              chain: appAccountClient.chain,
              account: appAccountClient.account,
              to: userAddress,
              value: withdrawAmount,
              gas: withdrawGas,
              ...fees,
            };
          },
          // TODO: figure out a good refresh rate (L1 block time? L2 commit time?)
          refetchInterval: 12_000,
          retry: (failureCount, error) => {
            // No need to retry if we know our balance is too low.
            if (/not enough to cover estimated transfer fee/.test(String(error))) {
              return false;
            }
            return failureCount < 3;
          },
        }
      : { queryKey, enabled: false },
  );
}
