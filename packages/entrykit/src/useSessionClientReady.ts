// Exported `useSessionClient` variant and only provides the session client once all prerequisites are met.

import { useConnectorClient } from "wagmi";
import { useSessionClient } from "./useSessionClient";
import { useEntryKitConfig } from "./EntryKitConfigProvider";
import { usePrerequisites } from "./onboarding/usePrerequisites";
import { UseQueryResult } from "@tanstack/react-query";
import { SessionClient } from "./common";

export function useSessionClientReady(): UseQueryResult<SessionClient | undefined> {
  const { chainId } = useEntryKitConfig();
  const userClient = useConnectorClient({ chainId });
  if (userClient.error) console.error("Error retrieving user client", userClient.error);

  const userAddress = userClient.data?.account.address;
  const prerequisites = usePrerequisites(userAddress);
  const sessionClient = useSessionClient(userAddress);

  if (!userClient.isSuccess) return { ...userClient, data: undefined } as never;
  if (!prerequisites.isSuccess || !prerequisites.data.complete) return { ...prerequisites, data: undefined } as never;
  return sessionClient;
}
