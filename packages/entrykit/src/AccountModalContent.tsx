import { useAccount, useConnectorClient } from "wagmi";
import { ConnectWallet } from "./ConnectWallet";
import { ConnectedSteps } from "./onboarding/ConnectedSteps";
import { useEntryKitConfig } from "./EntryKitConfigProvider";
import { useRef } from "react";

export function AccountModalContent() {
  const { chainId } = useEntryKitConfig();
  const { address: userAddress, connector } = useAccount();
  const userClient = useConnectorClient({ chainId, connector });
  const initialUserAddress = useRef(userAddress);

  if (userClient.status !== "success") {
    return <ConnectWallet />;
  }

  return (
    <ConnectedSteps
      connector={connector!}
      userClient={userClient.data}
      initialUserAddress={initialUserAddress.current}
    />
  );
}
