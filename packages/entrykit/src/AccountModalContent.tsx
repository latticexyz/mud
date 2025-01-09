import { useAccount, useConnectorClient } from "wagmi";
import { ConnectWallet } from "./ConnectWallet";
import { ConnectedSteps } from "./onboarding/ConnectedSteps";
import { useEntryKitConfig } from "./EntryKitConfigProvider";
import { useRef } from "react";

export function AccountModalContent() {
  const { chainId } = useEntryKitConfig();
  const userClient = useConnectorClient({ chainId });
  const { address: userAddress } = useAccount();
  const initialUserAddress = useRef(userAddress);

  if (userClient.status !== "success") {
    return <ConnectWallet />;
  }

  return <ConnectedSteps userClient={userClient.data} initialUserAddress={initialUserAddress.current} />;
}
