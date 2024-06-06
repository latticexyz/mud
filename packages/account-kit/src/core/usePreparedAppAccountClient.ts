import { AppAccountClient } from "./common";
import { useAccountRequirements } from "./useAccountRequirements";
import { useAppAccountClient } from "./useAppAccountClient";

// Used externally and only provides the app account client once all requirements are met.

export function usePreparedAppAccountClient(): AppAccountClient | undefined {
  const { data: appAccountClient } = useAppAccountClient();
  const { requirements } = useAccountRequirements();
  return requirements.length === 0 ? appAccountClient : undefined;
}
