// Used externally and only provides the app account client once all requirements are met.

import { useMemo } from "react";
import { useConnectorClient } from "wagmi";
import { useAppAccountClient } from "./useAppAccountClient";
import { useEntryKitConfig } from "./EntryKitConfigProvider";
import { useSteps } from "./onboarding/useSteps";
import { AppAccountClient } from "./common";

export function usePreparedAppAccountClient(): AppAccountClient | undefined {
  const { chainId } = useEntryKitConfig();
  const { data: userClient, error: userClientError } = useConnectorClient({ chainId });
  if (userClientError) console.error("Error retrieving user client", userClientError);

  const appAccountClient = useAppAccountClient(userClient?.account.address);
  const steps = useSteps(userClient);

  return useMemo(() => {
    if (!steps.every((step) => step.isComplete)) return;
    return appAccountClient.data;
  }, [appAccountClient.data, steps]);
}
