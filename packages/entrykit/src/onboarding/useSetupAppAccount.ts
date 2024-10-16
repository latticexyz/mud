import { Address, ContractFunctionParameters, Abi } from "viem";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getAction } from "viem/utils";
import { sendUserOperation, waitForUserOperationReceipt } from "viem/account-abstraction";
import { useEntryKitConfig } from "../EntryKitConfigProvider";
import { ConnectedClient, unlimitedDelegationControlId, worldAbi } from "../common";
import { paymasterAbi } from "../paymaster";

function defineCall<abi extends Abi | readonly unknown[]>(
  call: Omit<ContractFunctionParameters<abi>, "address"> & {
    to: Address;
    value?: bigint | undefined;
  },
) {
  return call;
}

export function useSetupAppAccount() {
  const { worldAddress, paymasterAddress } = useEntryKitConfig();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["setupAppAccount"],
    mutationFn: async ({
      userClient,
      appAccountAddress,
      registerSpender,
      registerDelegation,
    }: {
      userClient: ConnectedClient;
      appAccountAddress: Address;
      registerSpender: boolean;
      registerDelegation: boolean;
    }): Promise<void> => {
      // TODO: for non-smart accounts, collect signatures and store to be executed later?
      if (userClient.account.type !== "smart") {
        throw new Error("User account is not a smart account.");
      }

      const calls = [];

      if (registerSpender) {
        console.log("registering spender");
        calls.push(
          defineCall({
            to: paymasterAddress,
            abi: paymasterAbi,
            functionName: "registerSpender",
            args: [appAccountAddress],
          }),
        );
      }

      if (registerDelegation) {
        console.log("registering delegation");
        calls.push(
          defineCall({
            to: worldAddress,
            abi: worldAbi,
            functionName: "registerDelegation",
            args: [appAccountAddress, unlimitedDelegationControlId, "0x"],
          }),
        );
      }

      if (!calls.length) return;

      console.log("setting up account with", calls);
      const hash = await getAction(userClient, sendUserOperation, "sendUserOperation")({ calls });
      console.log("got user op hash", hash);

      const receipt = await getAction(userClient, waitForUserOperationReceipt, "waitForUserOperationReceipt")({ hash });
      console.log("got user op receipt", receipt);

      await queryClient.invalidateQueries({ queryKey: ["readContract"] });
    },
  });
}
