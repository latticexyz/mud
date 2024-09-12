"use client";

import { type Write } from "../../../../../observer/store";
import { msPerViewportWidth } from "./common";

export type Props = Write;

export function Write({ functionSignature, time: start, events }: Props) {
  return (
    <div className="pr-[10vw]">
      <div className="font-bold opacity-40 group-hover/write:opacity-100">
        {functionSignature} <span className="opacity-50">{new Date(start).toLocaleTimeString()}</span>
      </div>
      <div className="inline-grid bg-cyan-400/10 text-cyan-400">
        {events.map((event) => (
          <div key={event.type} className="col-start-1 flex">
            <div
              className="pointer-events-none shrink-0"
              style={{ width: `${((event.time - start) / msPerViewportWidth) * 100}vw` }}
            />
            <div className="h-[1.25em] shrink-0 whitespace-nowrap border-l-2 border-current">
              <div className="pointer-events-none invisible absolute px-1 leading-[1.25em] opacity-70 group-hover/write:visible">
                {event.type} <span className="text-white/60">{event.time - start}ms</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
