import { useConnectorClient } from "wagmi";
import { ConnectWallet } from "./onboarding/ConnectWallet";
import { ConnectedSteps } from "./onboarding/ConnectedSteps";
import { useEntryKitConfig } from "./EntryKitConfigProvider";

export function AccountModalContent() {
  const { chainId } = useEntryKitConfig();
  const userClient = useConnectorClient({ chainId });

  if (userClient.status !== "success") {
    return <ConnectWallet />;
  }

  return <ConnectedSteps userClient={userClient.data} />;
}
