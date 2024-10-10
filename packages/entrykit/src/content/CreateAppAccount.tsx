import { PendingIcon } from "../icons/PendingIcon";
import { ErrorNotice } from "../ErrorNotice";
import { AccountModalSection } from "../AccountModalSection";
import { useAppAccountClient } from "./useAppAccountClient";

export function CreateAppAccount() {
  const appAccountClient = useAppAccountClient();

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

  return <AccountModalSection>todo</AccountModalSection>;
}
