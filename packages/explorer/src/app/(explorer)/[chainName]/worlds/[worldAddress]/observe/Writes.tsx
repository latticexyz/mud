"use client";

import { useStore } from "zustand";
import { KeepInView } from "../../../../../../components/KeepInView";
import { store } from "../../../../../../observer/store";
import { Write } from "./Write";

export function Writes() {
  const writes = useStore(store, (state) => Object.values(state.writes));

  return (
    // TODO: replace with h-full once container is stretched to full height
    <div className="relative h-[80vh] overflow-auto">
      <KeepInView>
        <div className="flex flex-col gap-4 pb-10 text-xs leading-tight">
          {writes.length === 0 ? <>Waiting for transactions…</> : null}
          {writes.map((write) => (
            <div key={write.writeId} className="group/write flex gap-2">
              <Write {...write} />
            </div>
          ))}
        </div>
      </KeepInView>
    </div>
  );
}
