import { PendingIcon } from "../icons/PendingIcon";
import { ErrorNotice } from "../ErrorNotice";
import { AccountModalSection } from "../AccountModalSection";
import { useAppAccountClient } from "../useAppAccountClient";
import { Button } from "../ui/Button";
import { useSetupAppAccount } from "./useSetupAppAccount";
import { useAccountModal } from "../useAccountModal";
import { ConnectedClient } from "../common";

export type Props = {
  userClient: ConnectedClient;
  registerSpender: boolean;
  registerDelegation: boolean;
};

export function SetupAppAccount({ userClient, registerSpender, registerDelegation }: Props) {
  const { closeAccountModal } = useAccountModal();
  const appAccountClient = useAppAccountClient(userClient.account.address);
  const setup = useSetupAppAccount();

  if (appAccountClient.status === "pending") {
    // TODO: better loading state/message
    return (
      <AccountModalSection className="items-center justify-center">
        <PendingIcon />
      </AccountModalSection>
    );
  }

  if (appAccountClient.status === "error") {
    // TODO: better error state/message
    return (
      <AccountModalSection>
        <ErrorNotice error={appAccountClient.error} />
      </AccountModalSection>
    );
  }

  if (!registerSpender && !registerDelegation) {
    return (
      <AccountModalSection>
        <div className="text-lg font-medium">Your app account</div>
        <p>Blah blah blah app account</p>
        <p>All sorted</p>
      </AccountModalSection>
    );
  }

  return (
    <AccountModalSection>
      <div className="text-lg font-medium">Set up account</div>
      <p>Blah blah blah app account</p>
      {appAccountClient.data ? (
        <Button
          className="self-start"
          pending={setup.status === "pending"}
          onClick={async () => {
            await setup.mutateAsync({
              userClient,
              appAccountAddress: appAccountClient.data.account.address,
              registerSpender,
              registerDelegation,
            });
            closeAccountModal();
          }}
        >
          Set up
        </Button>
      ) : (
        <p>not ready</p>
      )}
    </AccountModalSection>
  );
}
