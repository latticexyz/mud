import { useAccount, useConnectorClient } from "wagmi";
import { isPasskeyConnector } from "../passkey/isPasskeyConnector";
import { Step } from "./Step";
import { useIsDeployed } from "./useIsDeployed";

export function PasskeySteps() {
  console.log("passkeySteps");
  const userAccount = useAccount();
  if (userAccount.status !== "connected") throw new Error("Not connected.");
  if (!isPasskeyConnector(userAccount.connector)) throw new Error("Not using passkey connector.");

  const { data: userClient } = useConnectorClient({ connector: userAccount.connector });
  const isDeployed = useIsDeployed(userClient?.account);

  // TODO: figure out better error approach, but hoping this is caught by error boundary and able to retry
  if (isDeployed.isError) throw new Error("Failed to check if passkey smart account is deployed.");
  if (isDeployed.isPending) {
    console.log("checking deployed");
    return (
      <Step id="setupPasskey" label="Setup" isComplete canComplete>
        Checking passkey setup
      </Step>
    );
  }

  if (isDeployed.data === false) {
    console.log("not deployed");
    return (
      <Step id="setupPasskey" label="Setup" isComplete canComplete>
        Doing passkey setup
      </Step>
    );
  }

  console.log("deployed");
  return (
    <Step id="setupPasskey" label="Setup" isComplete canComplete>
      Resuming passkey setup
    </Step>
  );
}
