import { useMutation } from "@tanstack/react-query";
import { useAppAccountClient } from "../../useAppAccountClient";
import IBaseWorldAbi from "@latticexyz/world/out/IBaseWorld.sol/IBaseWorld.abi.json";
import { writeContract } from "viem/actions";
import { getAction } from "viem/utils";
import { useConfig } from "../../AccountKitConfigProvider";
import { Button } from "../../ui/Button";

export function RevokeButton() {
  const { worldAddress } = useConfig();
  const { data: appAccountClient } = useAppAccountClient();

  const revoke = useMutation({
    mutationKey: ["unregisterDelegation", appAccountClient?.account.address],
    mutationFn: async () => {
      if (!appAccountClient) throw new Error("App account client not ready.");

      console.log("calling unregisterDelegation");
      return await getAction(
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
    },
  });

  return (
    <Button pending={revoke.isPending} onClick={() => revoke.mutateAsync()}>
      Revoke
    </Button>
  );
}
