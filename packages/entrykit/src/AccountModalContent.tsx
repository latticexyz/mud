import { useAccount, useConnectorClient } from "wagmi";
import { ConnectWallet } from "./ConnectWallet";
import { ConnectedSteps } from "./onboarding/ConnectedSteps";
import { useEntryKitConfig } from "./EntryKitConfigProvider";
import { useRef } from "react";

export function AccountModalContent() {
  const { chainId } = useEntryKitConfig();
  const userClient = useConnectorClient({ chainId });
  const initialAddress = useRef(useAccount().address);

  if (userClient.status !== "success") {
    return <ConnectWallet />;
  }

  return <ConnectedSteps userClient={userClient.data} initialAddress={initialAddress.current} />;
}
