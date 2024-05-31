import { useMutation } from "@tanstack/react-query";
import { useAppAccountClient } from "../../useAppAccountClient";
import { sendTransaction, waitForTransactionReceipt } from "viem/actions";
import { getAction } from "viem/utils";
import { Button } from "../../ui/Button";
import { AppAccountClient } from "../../common";
import { SendTransactionParameters } from "viem";
import { useInvalidateBalance } from "./useInvalidateBalance";
import { usePrepareWithdraw } from "./usePrepareWithdraw";
import { useAccount } from "wagmi";

export function WithdrawButton() {
  const invalidateBalance = useInvalidateBalance();
  const { data: appAccountClient } = useAppAccountClient();
  const { address: userAddress } = useAccount();

  const prepared = usePrepareWithdraw({ appAccountClient, userAddress });

  const withdraw = useMutation({
    mutationKey: ["withdraw"],
    mutationFn: async ({
      appAccountClient,
      params,
    }: {
      appAccountClient: AppAccountClient;
      params: SendTransactionParameters;
    }) => {
      console.log("withdrawing funds");
      const hash = await getAction(appAccountClient, sendTransaction, "sendTransaction")(params);
      console.log("waiting for withdraw", hash);

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
      pending={appAccountClient == null || prepared.isLoading || withdraw.isPending}
      disabled={prepared.isError}
      onClick={() =>
        withdraw.mutateAsync({
          appAccountClient: appAccountClient!,
          params: prepared.data!,
        })
      }
    >
      Withdraw
    </Button>
  );
}
