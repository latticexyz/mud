import { useConnectors } from "wagmi";
import { PasskeyConnector, passkeyConnector } from "./passkey/passkeyConnector";

export function usePasskeyConnector(): PasskeyConnector {
  const connectors = useConnectors();
  const connector = connectors.find((c) => c.type === passkeyConnector.type);
  if (!connector) {
    // TODO: provide link to instructions
    throw new Error(
      "Could not find passkey connector. Did you configure Wagmi with the EntryKit passkey connector or passkey wallet?",
    );
  }
  return connector as never;
}
