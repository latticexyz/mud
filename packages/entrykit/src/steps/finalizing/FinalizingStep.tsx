import { AccountModalSection } from "../../AccountModalSection";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PendingIcon } from "../../icons/PendingIcon";
import { useSignRegisterDelegation } from "../app-account/useSignRegisterDelegation";
import { useAccount } from "wagmi";
import { useAppAccountClient } from "../../useAppAccountClient";
import { useOnboardingSteps } from "../../useOnboardingSteps";
import { useEntryKitConfig } from "../../EntryKitConfigProvider";
import { registerDelegationWithSignature } from "../app-account/registerDelegationWithSignature";
import { waitForTransactionReceipt } from "viem/actions";
import { useAccountModal } from "../../useAccountModal";
import { ErrorNotice } from "../../ErrorNotice";

export function FinalizingStep() {
  const queryClient = useQueryClient();
  const { worldAddress } = useEntryKitConfig();
  const { data: appAccountClient } = useAppAccountClient();
  const { address: userAddress } = useAccount();
  const { resetStep } = useOnboardingSteps();
  const { registerDelegationSignature, clearSignature } = useSignRegisterDelegation();
  const { closeAccountModal } = useAccountModal();

  // I am taking a bit of a gamble here executing a transaction with useQuery,
  // but I couldn't get useMutation to play nicely without sending the transaction
  // multiple times. I could track when the mutation was called, but that's kinda
  // what useQuery is meant to do for us with queryKey.
  const queryKey = [
    "registerDelegation",
    worldAddress,
    appAccountClient?.chain.id.toString(),
    appAccountClient?.account.address,
    userAddress,
    registerDelegationSignature,
  ];

  const registerDelegation = useQuery(
    worldAddress && appAccountClient && userAddress && registerDelegationSignature
      ? {
          queryKey,
          queryFn: async () => {
            console.log("calling registerDelegationWithSignature");
            const hash = await registerDelegationWithSignature({
              worldAddress,
              appAccountClient,
              userAddress,
              signature: registerDelegationSignature,
            }).catch((error) => {
              if (/InvalidSignature\(/.test(String(error))) {
                console.log("invalid delegation signature, clearing to try again");
                clearSignature();
              }
              throw error;
            });
            console.log("waiting for delegation tx", hash);
            const receipt = await waitForTransactionReceipt(appAccountClient, { hash });
            console.log("got delegation receipt", receipt);
            console.log("clearing query cache");
            await queryClient.invalidateQueries({
              // TODO: replace `useReadContract` in `useRecord` with our own `useQuery` so we can customize the query key
              queryKey: ["readContract"],
            });
            clearSignature();
            resetStep();
            closeAccountModal();
            return receipt;
          },
          refetchOnMount: false,
          refetchOnReconnect: false,
          refetchOnWindowFocus: false,
          retry: false,
        }
      : {
          queryKey,
          enabled: false,
        },
  );

  // TODO: rework with nicer pending + error states

  if (registerDelegation.isError) {
    console.error("register delegation error", registerDelegation.error);
    return (
      <AccountModalSection>
        <ErrorNotice error={registerDelegation.error} />
      </AccountModalSection>
    );
  }

  return (
    <AccountModalSection className="flex-grow">
      <div className="flex-grow flex flex-col items-center justify-center">
        <PendingIcon />
      </div>
    </AccountModalSection>
  );
}
