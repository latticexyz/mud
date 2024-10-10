import { Connector, useAccount } from "wagmi";
import { isPasskeyConnector } from "../passkey/isPasskeyConnector";
import { PasskeyConnector } from "../passkey/passkeyConnector";

export function usePasskeyConnector(): PasskeyConnector & Connector {
  const userAccount = useAccount();
  const userConnector = userAccount.connector;
  if (!isPasskeyConnector(userConnector)) {
    throw new Error("Not connected with passkey.");
  }
  return userConnector;
}
