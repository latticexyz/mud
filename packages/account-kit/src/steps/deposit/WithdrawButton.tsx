import { useMutation } from "@tanstack/react-query";
import { useAppAccountClient } from "../../useAppAccountClient";
import { sendTransaction, waitForTransactionReceipt } from "viem/actions";
import { getAction } from "viem/utils";
import { Button } from "../../ui/Button";
import { AppAccountClient } from "../../common";
import { useAccount, useBalance } from "wagmi";
import { Hex } from "viem";
import { useInvalidateBalance } from "./useInvalidateBalance";

export function WithdrawButton() {
  const invalidateBalance = useInvalidateBalance();
  const { address: userAddress } = useAccount();
  const { data: appAccountClient } = useAppAccountClient();
  const { data: balance } = useBalance({
    chainId: appAccountClient?.chain.id,
    address: appAccountClient?.account.address,
  });

  // TODO: estimate this for real with `estimateTotalGas` and price oracle
  const withdrawFee = 100_000_000_000n;
  const withdrawAmount = balance ? balance.value - withdrawFee : undefined;
  // TODO: lift this up so we can conditionally hide the button

  const withdraw = useMutation({
    mutationKey: ["withdraw", appAccountClient?.account.address],
    mutationFn: async ({
      appAccountClient,
      userAddress,
      amount,
    }: {
      appAccountClient: AppAccountClient;
      userAddress: Hex;
      amount: bigint;
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
      pending={userAddress == null || appAccountClient == null || withdrawAmount == null || withdraw.isPending}
      disabled={withdrawAmount ? withdrawAmount <= 0n : false}
      onClick={() =>
        withdraw.mutateAsync({
          userAddress: userAddress!,
          appAccountClient: appAccountClient!,
          amount: withdrawAmount!,
        })
      }
    >
      Withdraw
    </Button>
  );
}
