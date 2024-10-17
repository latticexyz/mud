import { useAppAccountClient } from "../useAppAccountClient";
import { Button } from "../ui/Button";
import { useSetupAppAccount } from "./useSetupAppAccount";
import { useAccountModal } from "../useAccountModal";
import { ConnectedClient } from "../common";

export type Props = {
  isActive: boolean;
  isExpanded: boolean;
  userClient: ConnectedClient;
  registerSpender: boolean;
  registerDelegation: boolean;
};

export function Session({ isActive, isExpanded, userClient, registerSpender, registerDelegation }: Props) {
  const { closeAccountModal } = useAccountModal();
  const appAccountClient = useAppAccountClient(userClient.account.address);
  const setup = useSetupAppAccount();

  const isReady = !registerDelegation && !registerDelegation;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between gap-4">
        <div>
          <div>Session</div>
          <div className="font-mono text-white">{isReady ? "Approved" : "Set up"}</div>
        </div>
        {isReady ? (
          <Button variant={isActive ? "primary" : "secondary"} className="flex-shrink-0 text-sm p-1 w-28" disabled>
            {/* TODO: revoke */}
            Revoke
          </Button>
        ) : (
          <Button
            variant={isActive ? "primary" : "secondary"}
            className="flex-shrink-0 text-sm p-1 w-28"
            pending={!appAccountClient.data || setup.status === "pending"}
            onClick={
              appAccountClient.data
                ? async () => {
                    await setup.mutateAsync({
                      userClient,
                      appAccountAddress: appAccountClient.data.account.address,
                      registerSpender,
                      registerDelegation,
                    });
                    closeAccountModal();
                  }
                : undefined
            }
          >
            Approve
          </Button>
        )}
      </div>
      {isExpanded ? (
        <p className="text-sm">You can perform actions in this app without interruptions for approvals.</p>
      ) : null}
    </div>
  );
}
