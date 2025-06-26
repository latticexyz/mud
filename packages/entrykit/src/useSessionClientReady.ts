// Exported `useSessionClient` variant and only provides the session client once all prerequisites are met.

import { useAccount } from "wagmi";
import { useSessionClient } from "./useSessionClient";
import { usePrerequisites } from "./onboarding/usePrerequisites";
import { UseQueryResult } from "@tanstack/react-query";
import { SessionClient } from "./common";

export function useSessionClientReady(): UseQueryResult<SessionClient | undefined> {
  const { address: userAddress } = useAccount();

  const prerequisites = usePrerequisites(userAddress);
  const sessionClient = useSessionClient(userAddress);

  if (!prerequisites.isSuccess || !prerequisites.data.complete) {
    return { ...prerequisites, data: undefined } as never;
  }

  return sessionClient;
}
