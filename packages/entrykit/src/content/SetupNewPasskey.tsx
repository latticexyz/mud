import { useAccount } from "wagmi";
import { isPasskeyConnector } from "../passkey/isPasskeyConnector";

export function SetupNewPasskey() {
  const userAccount = useAccount();
  const userConnector = userAccount.connector;
  const isPasskey = isPasskeyConnector(userConnector);
  if (!isPasskey) throw new Error("Not connected with passkey.");
}
