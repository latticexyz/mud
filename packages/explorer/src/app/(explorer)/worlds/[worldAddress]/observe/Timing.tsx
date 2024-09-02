import { useStore } from "zustand";
import { createStore } from "zustand/vanilla";
import { useEffect } from "react";
import { usePromise } from "@latticexyz/react";
import { TimingPromise } from "../../../../../transactions/store";

export type Props = {
  label: string;
  promise: TimingPromise;
};

const store = createStore(() => ({ maxDuration: 500 }));

export function Timing({ label, promise }: Props) {
  const maxDuration = useStore(store, (state) => state.maxDuration);

  const timing = usePromise(promise);
  useEffect(() => {
    if (timing.status === "fulfilled") {
      const duration = timing.value.end - timing.value.start;
      store.setState({
        maxDuration: Math.min(
          // bound to 10s max
          // TODO: log scale instead?
          10_000,
          Math.max(duration, store.getState().maxDuration),
        ),
      });
    }
  }, [timing]);

  if (timing.status === "rejected") {
    // should never happen, timing promises always resolve
    return <div className="bg-red-700/50 hover:bg-red-700">{label} error</div>;
  }
  if (timing.status === "idle" || timing.status === "pending") {
    return <div className="animate-pulse">{label} pending</div>;
  }
  const duration = timing.value.end - timing.value.start;
  return (
    <div
      className="bg-green-700/50 hover:bg-green-700"
      style={{
        width: `${Math.max(2, Math.round((duration / maxDuration) * 100))}%`,
      }}
    >
      {label} in {duration}
      ms
    </div>
  );
}
