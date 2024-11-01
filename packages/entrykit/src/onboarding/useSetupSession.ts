import { Address, ContractFunctionParameters, Abi } from "viem";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getAction } from "viem/utils";
import { sendUserOperation, waitForUserOperationReceipt } from "viem/account-abstraction";
import { useEntryKitConfig } from "../EntryKitConfigProvider";
import { ConnectedClient, unlimitedDelegationControlId, worldAbi } from "../common";
import { paymasterAbi } from "../paymaster";
import { writeContract } from "viem/actions";

function defineCall<abi extends Abi | readonly unknown[]>(
  call: Omit<ContractFunctionParameters<abi>, "address"> & {
    to: Address;
    value?: bigint | undefined;
  },
) {
  return call;
}

export function useSetupSession() {
  const { worldAddress, paymasterAddress } = useEntryKitConfig();
  const queryClient = useQueryClient();

  const mutationKey = ["setupSession"];
  return useMutation({
    mutationKey,
    onError: (error) => console.error(error),
    mutationFn: async ({
      userClient,
      sessionAddress,
      registerSpender,
      registerDelegation,
    }: {
      userClient: ConnectedClient;
      sessionAddress: Address;
      registerSpender: boolean;
      registerDelegation: boolean;
    }): Promise<void> => {
      // TODO: for non-smart accounts, collect signatures and store to be executed later?
      if (userClient.account.type !== "smart") {
        await getAction(
          userClient,
          writeContract,
          "writeContract",
        )({
          chain: userClient.chain,
          account: userClient.account,
          address: paymasterAddress,
          abi: paymasterAbi,
          functionName: "registerSpender",
          args: [sessionAddress],
        });
        await getAction(
          userClient,
          writeContract,
          "writeContract",
        )({
          chain: userClient.chain,
          account: userClient.account,
          address: worldAddress,
          abi: worldAbi,
          functionName: "registerDelegation",
          args: [sessionAddress, unlimitedDelegationControlId, "0x"],
        });
      }

      const calls = [];

      if (registerSpender) {
        console.log("registering spender");
        calls.push(
          defineCall({
            to: paymasterAddress,
            abi: paymasterAbi,
            functionName: "registerSpender",
            args: [sessionAddress],
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
            args: [sessionAddress, unlimitedDelegationControlId, "0x"],
          }),
        );
      }

      if (!calls.length) return;

      console.log("setting up account with", calls, userClient);
      const hash = await getAction(userClient, sendUserOperation, "sendUserOperation")({ calls });
      console.log("got user op hash", hash);

      const receipt = await getAction(userClient, waitForUserOperationReceipt, "waitForUserOperationReceipt")({ hash });
      console.log("got user op receipt", receipt);

      // TODO: throw if revert?
      if (!receipt.success) {
        console.error("not successful?", receipt);
        return;
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["getSpender"] }),
        queryClient.invalidateQueries({ queryKey: ["getDelegation"] }),
        queryClient.invalidateQueries({ queryKey: ["getPrerequisites"] }),
      ]);
    },
    retry: 0,
  });
}
