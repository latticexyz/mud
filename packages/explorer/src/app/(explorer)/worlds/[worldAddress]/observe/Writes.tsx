"use client";

import { useStore } from "zustand";
import { KeepInView } from "../../../../../components/KeepInView";
import { store } from "../../../../../monitor/store";
import { Timing } from "./Timing";

export function Writes() {
  const writes = useStore(store, (state) => Object.values(state.writes));
  return (
    <KeepInView>
      <div className="pb-40 text-xs leading-tight">
        {Object.values(writes).map((write, i) => (
          <div key={write.id} className="py-1">
            <div className="p-1 font-bold">
              <span className="opacity-50">{i + 1}.</span> {write.functionSignature}
            </div>
            <div className="ml-2">
              {Object.entries(write.timings).map(([label, promise]) => (
                <div key={label} className="whitespace-nowrap indent-1 text-white/50 hover:text-white">
                  <Timing label={label} promise={promise} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </KeepInView>
  );
}
