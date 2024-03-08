import { type ReactNode } from "react";
import { SyncStep } from "@latticexyz/store-sync";
import { useNetwork } from "./NetworkContext";

export function StoreSync(props: { children: ReactNode }) {
  const { useStore } = useNetwork();

  const { step, message, percentage } = useStore((state) => state.syncProgress);

  if (step === SyncStep.LIVE) {
    return props.children;
  }

  return (
    <div>
      {message} ({Math.floor(percentage)}%)
    </div>
  );
}
