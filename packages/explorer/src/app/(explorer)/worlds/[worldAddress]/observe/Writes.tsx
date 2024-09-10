"use client";

import { useStore } from "zustand";
import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { KeepInView } from "../../../../../components/KeepInView";
import { store } from "../../../../../monitor/store";
import { Write } from "./Write";
import { timePerPage } from "./common";

export function Writes() {
  const writes = useStore(store, (state) => Object.values(state.writes));
  const [focusedWrite, setFocusedWrite] = useState<string | null>(null);
  const activeWrite = focusedWrite ?? writes.at(-1)?.writeId;

  const start = writes.at(0)?.time ?? Date.now();
  const end = Math.max(start + timePerPage * 2, writes.at(-1)?.time ?? Date.now());

  return (
    // TODO: replace with h-full once container is stretched to full height
    <div className="relative h-[80vh] overflow-auto">
      <div
        className="flex flex-col text-xs leading-tight"
        style={{ width: `${((end - start) / timePerPage) * 100}vw` }}
      >
        {writes.length === 0 ? <>Waiting for transactions…</> : null}
        {writes.map((write, i) => (
          <div
            tabIndex={i}
            key={write.writeId}
            className={twMerge("group/write flex gap-2 p-2", focusedWrite === write.writeId ? "bg-yellow-400/5" : null)}
            onFocus={() => setFocusedWrite(write.writeId)}
            onBlur={() => setFocusedWrite(null)}
          >
            <div className="sticky left-0 shrink-0 self-start">
              <Write {...write} />
            </div>
            <div className="shrink-0" style={{ width: `${((write.time - start) / timePerPage) * 100}vw` }} />
            <div className="shrink-0">
              <KeepInView enabled={activeWrite === write.writeId}>
                <Write {...write} />
              </KeepInView>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
