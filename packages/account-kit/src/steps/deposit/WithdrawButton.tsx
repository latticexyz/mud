import { useMutation, useQuery } from "@tanstack/react-query";
import { useAppAccountClient } from "../../useAppAccountClient";
import { sendTransaction, waitForTransactionReceipt } from "viem/actions";
import { getAction } from "viem/utils";
import { Button } from "../../ui/Button";
import { AppAccountClient } from "../../common";
import { useAccount, useBalance, useEstimateFeesPerGas, useEstimateGas } from "wagmi";
import { EstimateFeesPerGasReturnType, Hex } from "viem";
import { useInvalidateBalance } from "./useInvalidateBalance";
import { estimateL1Fee } from "viem/op-stack";
import { useConfig } from "../../AccountKitConfigProvider";

export function WithdrawButton() {
  const invalidateBalance = useInvalidateBalance();
  const { chainId } = useConfig();
  const { address: userAddress } = useAccount();
  const { data: appAccountClient } = useAppAccountClient();
  const { data: balance } = useBalance({
    chainId: appAccountClient?.chain.id,
    address: appAccountClient?.account.address,
  });

  const queryKey = ["withdrawL1Fee", appAccountClient?.account.address, userAddress];
  const withdrawL1Fee = useQuery(
    appAccountClient && userAddress
      ? {
          queryKey,
          queryFn: async () => {
            // TODO: detect if we need to estimate this (based on chain and chain contracts), return 0 if not

            // We use estimateL1Fee instead of estimateTotalFee, so we can separately estimate L2 gas and pass it in as part of the tx args
            const fee = await estimateL1Fee(appAccountClient!, {
              account: appAccountClient!.account,
              to: userAddress!,
              value: 1n,
            });
            return fee;
          },
          // TODO: figure out a good refresh rate (L1 block time? L2 commit time?)
          refetchInterval: 4_000,
        }
      : { queryKey, enabled: false },
  );

  const estimateFee = useEstimateFeesPerGas({ chainId });
  const estimateGas = useEstimateGas({
    account: appAccountClient?.account,
    to: userAddress,
    value: 1n,
  });

  const withdrawL2Fee =
    estimateFee.isSuccess && estimateGas.isSuccess ? estimateGas.data * estimateFee.data.maxFeePerGas : undefined;

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
        estimateGas.isPending ||
        estimateFee.isPending
      }
      disabled={withdrawAmount ? withdrawAmount <= 0n : false}
      onClick={() =>
        withdraw.mutateAsync({
          userAddress: userAddress!,
          appAccountClient: appAccountClient!,
          amount: withdrawAmount!,
          gas: estimateGas.data!,
          fees: estimateFee.data!,
        })
      }
    >
      Withdraw
    </Button>
  );
}
