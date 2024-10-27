import { Button } from "../ui/Button";
import { useSetupSession } from "./useSetupSession";
import { useAccountModal } from "../useAccountModal";
import { ConnectedClient } from "../common";
import { useEffect } from "react";
import { useSessionAccount } from "../useSessionAccount";

export type Props = {
  isActive: boolean;
  isExpanded: boolean;
  userClient: ConnectedClient;
  registerSpender: boolean;
  registerDelegation: boolean;
};

export function Session({ isActive, isExpanded, userClient, registerSpender, registerDelegation }: Props) {
  const { closeAccountModal } = useAccountModal();
  const sessionAccount = useSessionAccount(userClient.account.address);
  const sessionAddress = sessionAccount.data?.address;
  const setup = useSetupSession();

  const isReady = !registerDelegation && !registerDelegation;

  useEffect(() => {
    if (isActive && setup.status === "idle" && sessionAddress && !isReady) {
      setup.mutate(
        {
          userClient,
          sessionAddress,
          registerSpender,
          registerDelegation,
        },
        { onSuccess: closeAccountModal },
      );
    }
  }, [closeAccountModal, isActive, isReady, registerDelegation, registerSpender, sessionAddress, setup, userClient]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between gap-4">
        <div>
          <div>Session</div>
          <div className="font-mono text-white">{isReady ? "Enabled" : "Set up"}</div>
        </div>
        {isReady ? (
          <Button variant={isActive ? "primary" : "secondary"} className="flex-shrink-0 text-sm p-1 w-28" disabled>
            {/* TODO: revoke */}
            Disable
          </Button>
        ) : (
          <Button
            variant={isActive ? "primary" : "secondary"}
            className="flex-shrink-0 text-sm p-1 w-28"
            pending={!sessionAddress || setup.status === "pending"}
            onClick={
              sessionAddress
                ? () =>
                    setup.mutate(
                      {
                        userClient,
                        sessionAddress,
                        registerSpender,
                        registerDelegation,
                      },
                      {
                        onSuccess: closeAccountModal,
                      },
                    )
                : undefined
            }
          >
            Enable
          </Button>
        )}
      </div>
      {isExpanded ? (
        <p className="text-sm">You can perform actions in this app without interruptions for approvals.</p>
      ) : null}
    </div>
  );
}
