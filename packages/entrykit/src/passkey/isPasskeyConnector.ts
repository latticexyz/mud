import { CreateConnectorFn } from "wagmi";
import { PasskeyConnector, passkeyConnector } from "./passkeyConnector";

export function isPasskeyConnector(connector: ReturnType<CreateConnectorFn>): connector is PasskeyConnector {
  return connector.type === passkeyConnector.type;
}
