import { useMutation, useQuery } from "@tanstack/react-query";
import { useAppAccountClient } from "../../useAppAccountClient";
import { prepareTransactionRequest, readContract, sendTransaction, waitForTransactionReceipt } from "viem/actions";
import { getAction, getChainContractAddress, serializeTransaction } from "viem/utils";
import { Button } from "../../ui/Button";
import { AppAccountClient } from "../../common";
import { useAccount, useBalance, useEstimateFeesPerGas, useEstimateGas } from "wagmi";
import { EstimateFeesPerGasReturnType, Hex, maxUint256 } from "viem";
import { gasPriceOracleAbi } from "viem/op-stack/abis";
import { useInvalidateBalance } from "./useInvalidateBalance";
import { estimateL1Fee } from "viem/op-stack";
import { useConfig } from "../../AccountKitConfigProvider";

// TODO: switch network

export function WithdrawButton() {
  const invalidateBalance = useInvalidateBalance();
  const { chainId } = useConfig();
  const { address: userAddress } = useAccount();
  const { data: appAccountClient } = useAppAccountClient();
  const { data: balance } = useBalance({
    chainId: appAccountClient?.chain.id,
    address: appAccountClient?.account.address,
  });

  const estimateL2Fee = useEstimateFeesPerGas({ chainId });
  // sending value is a constant 21k gas
  const withdrawL2Gas = 21000n;

  const queryKey = [
    "withdrawL1Fee",
    appAccountClient?.chain.id,
    appAccountClient?.account.address,
    userAddress,
    balance!.value.toString(),
  ];
  const withdrawL1Fee = useQuery(
    appAccountClient && userAddress && balance
      ? {
          queryKey,
          queryFn: async () => {
            return estimateL1Fee(appAccountClient, {
              account: appAccountClient.account,
              to: userAddress,
              value: balance.value,
              // Skip gas estimation of `prepareTransactionRequest` inside `estimateL1Fee`,
              // otherwise this will fail due to `balance` not being enough to cover `value` + `fee`.
              gas: 0n,
            });
          },
          // TODO: figure out a good refresh rate (L1 block time? L2 commit time?)
          refetchInterval: 4_000,
        }
      : { queryKey, enabled: false },
  );

  console.log("balance", balance?.value);
  console.log("withdrawL1Fee", withdrawL1Fee.status, withdrawL1Fee.data, withdrawL1Fee.error);

  const withdrawL2Fee = estimateL2Fee.isSuccess ? withdrawL2Gas * estimateL2Fee.data.maxFeePerGas : undefined;
  const withdrawFee = withdrawL1Fee.isSuccess && withdrawL2Fee != null ? withdrawL1Fee.data + withdrawL2Fee : undefined;
  const withdrawAmount = balance && withdrawFee != null ? balance.value - withdrawFee : undefined;

  // TODO: lift this up so we can conditionally hide the button

  const withdraw = useMutation({
    mutationKey: ["withdraw", appAccountClient?.account.address],
    mutationFn: async ({
      appAccountClient,
      userAddress,
      amount,
      gas,
      fees,
    }: {
      appAccountClient: AppAccountClient;
      userAddress: Hex;
      amount: bigint;
      gas: bigint;
      fees: EstimateFeesPerGasReturnType;
    }) => {
      console.log("withdrawing funds");
      const hash = await getAction(
        appAccountClient,
        sendTransaction,
        "sendTransaction",
      )({
        chain: appAccountClient.chain,
        account: appAccountClient.account,
        to: userAddress,
        value: amount,
        gas,
        ...fees,
      });

      const receipt = await getAction(
        appAccountClient,
        waitForTransactionReceipt,
        "waitForTransactionReceipt",
      )({ hash });

      if (receipt.status === "success") {
        await invalidateBalance();
      }
    },
  });

  return (
    <Button
      variant="secondary"
      className="p-2 text-sm"
      pending={
        userAddress == null ||
        appAccountClient == null ||
        withdrawAmount == null ||
        withdraw.isPending ||
        estimateL2Fee.isPending
      }
      disabled={withdrawAmount ? withdrawAmount <= 0n : false}
      onClick={() =>
        withdraw.mutateAsync({
          userAddress: userAddress!,
          appAccountClient: appAccountClient!,
          amount: withdrawAmount!,
          gas: withdrawL2Gas,
          fees: estimateL2Fee.data!,
        })
      }
    >
      Withdraw
    </Button>
  );
}
