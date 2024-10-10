import { useAccount } from "wagmi";
import { isPasskeyConnector } from "../passkey/isPasskeyConnector";
import { Step } from "./common";
import { useMemo } from "react";

export function usePasskeySteps(): Step[] {
  const userAccount = useAccount();
  const userConnector = userAccount.connector;

  return useMemo((): Step[] => {
    if (!isPasskeyConnector(userConnector)) return [];

    return [
      // TODO
    ];
  }, [userConnector]);
}
