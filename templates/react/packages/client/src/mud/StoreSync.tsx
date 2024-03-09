import { type ReactNode } from "react";
import { SyncStep } from "@latticexyz/store-sync";
import { useNetwork } from "./NetworkContext";

type Props = {
  children: ReactNode;
};

// A React component that checks the client store's synchronization status.
// It does not render its children until synchronization is complete.
// Until then, it displays a loading message.
export function StoreSync({ children }: Props) {
  const { useStore } = useNetwork();

  const { step, message, percentage } = useStore((state) => state.syncProgress);

  if (step === SyncStep.LIVE) return children;

  return (
    <div>
      {message} ({Math.floor(percentage)}%)
    </div>
  );
}
