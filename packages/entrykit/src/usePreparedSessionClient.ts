// Used externally and only provides the app account client once all requirements are met.

import { useMemo } from "react";
import { useConnectorClient } from "wagmi";
import { useSessionClient } from "./useSessionClient";
import { useEntryKitConfig } from "./EntryKitConfigProvider";
import { useSteps } from "./onboarding/useSteps";
import { SessionClient } from "./common";

export function usePreparedSessionClient(): SessionClient | undefined {
  const { chainId } = useEntryKitConfig();
  const { data: userClient, error: userClientError } = useConnectorClient({ chainId });
  if (userClientError) console.error("Error retrieving user client", userClientError);

  const sessionClient = useSessionClient(userClient?.account.address);
  const steps = useSteps(userClient);

  return useMemo(() => {
    if (!steps.every((step) => step.isComplete)) return;
    return sessionClient.data;
  }, [sessionClient.data, steps]);
}
