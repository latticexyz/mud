// Used externally and only provides the app account client once all requirements are met.

import { Client, Transport, Chain, Account } from "viem";
import { useAppAccountClient } from "./onboarding/useAppAccountClient";

export function usePreparedAppAccountClient(): Client<Transport, Chain, Account> | undefined {
  const appAccountClient = useAppAccountClient();
  // TODO: return entire useQuery result?
  // TODO: extend client with MUD, etc. actions
  // TODO: check for allowance, spender, delegation
  return appAccountClient.data;
}
