import { useAccount, useConnectorClient } from "wagmi";
import { isPasskeyConnector } from "../passkey/isPasskeyConnector";
import { Step } from "./common";
import { useIsDeployed } from "./useIsDeployed";
import { useMemo } from "react";
import { usePasskeyConnector } from "./usePasskeyConnector";

export function usePasskeySteps(): Step[] {
  const userConnector = usePasskeyConnector();
  const { data: userClient } = useConnectorClient({ connector: userConnector });

  console.log("userClient", userClient?.type);
  const canInitialize = useIsDeployed(userClient?.account);

  // TODO: figure out better error approach, but hoping this is caught by error boundary and able to retry
  if (isDeployed.isError) throw new Error("Failed to check if passkey smart account is deployed.");

  return useMemo((): Step[] => {
    if (!isPasskey) return [];

    if (isDeployed.isPending) {
      return [
        {
          id: "setupPasskey",
          label: "Setup",
          isComplete: false,
          canComplete: true,
          content: <>Checking passkey setup</>,
        },
      ];
    }

    if (isDeployed.data === false) {
      return [
        {
          id: "setupPasskey",
          label: "Setup",
          isComplete: false,
          canComplete: true,
          content: <>Doing passkey setup</>,
        },
      ];
    }

    return [
      {
        id: "setupPasskey",
        label: "Setup",
        isComplete: false,
        canComplete: true,
        content: <>Resuming passkey setup</>,
      },
    ];
  }, [isDeployed.data, isDeployed.isPending, isPasskey]);
}
