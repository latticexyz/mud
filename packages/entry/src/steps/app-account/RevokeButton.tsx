import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppAccountClient } from "../../useAppAccountClient";
import IBaseWorldAbi from "@latticexyz/world/out/IBaseWorld.sol/IBaseWorld.abi.json";
import { waitForTransactionReceipt, writeContract } from "viem/actions";
import { getAction } from "viem/utils";
import { useConfig } from "../../EntryConfigProvider";
import { Button } from "../../ui/Button";

export function RevokeButton() {
  const queryClient = useQueryClient();
  const { worldAddress } = useConfig();
  const { data: appAccountClient } = useAppAccountClient();

  const revoke = useMutation({
    mutationKey: ["unregisterDelegation", appAccountClient?.account.address],
    mutationFn: async () => {
      if (!appAccountClient) throw new Error("App account client not ready.");

      console.log("calling unregisterDelegation");
      const hash = await getAction(
        appAccountClient,
        writeContract,
        "writeContract",
      )({
        address: worldAddress,
        abi: IBaseWorldAbi,
        functionName: "unregisterDelegation",
        account: appAccountClient.account,
        chain: appAccountClient.chain,
        args: [appAccountClient.account.address],
      });

      const receipt = await getAction(
        appAccountClient,
        waitForTransactionReceipt,
        "waitForTransactionReceipt",
      )({ hash });

      if (receipt.status === "success") {
        await queryClient.invalidateQueries({
          // TODO: replace `useReadContract` in `useRecord` with our own `useQuery` so we can customize the query key
          queryKey: ["readContract"],
        });
      }
    },
  });

  return (
    <Button pending={revoke.isPending} onClick={() => revoke.mutateAsync()}>
      Revoke
    </Button>
  );
}
