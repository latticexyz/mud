import { type ReactNode } from "react";
import { SyncStep } from "@latticexyz/store-sync";
import { useNetwork } from "./NetworkContext";

export function StoreSync(props: { children: ReactNode }) {
  const { useStore } = useNetwork();

  const syncProgress = useStore((state) => state.syncProgress);

  if (syncProgress.step === SyncStep.LIVE) {
    return props.children;
  } else {
    return (
      <div>
        {syncProgress.message} ({Math.floor(syncProgress.percentage)}%)
      </div>
    );
  }
}
