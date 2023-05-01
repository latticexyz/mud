import { useRef, useEffect } from "react";
import { useNetworkStore } from "../useNetworkStore";

export function StoreLogPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const hoveredRef = useRef(false);
  const storeEvents = useNetworkStore((state) => state.storeEvents);

  const lastBlockNumber = storeEvents[storeEvents.length - 1]?.blockNumber;

  useEffect(() => {
    if (!containerRef.current) return;
    if (hoveredRef.current) return;
    containerRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [storeEvents]);

  return (
    <div
      ref={containerRef}
      className="px-1 pb-1"
      onMouseEnter={() => {
        hoveredRef.current = true;
      }}
      onMouseLeave={() => {
        hoveredRef.current = false;
      }}
    >
      <table className="w-full table-fixed">
        <thead className="sticky top-0 z-10 bg-slate-800 text-white/40 text-left">
          <tr>
            <th className="px-1 pt-1.5 pb-0.5 w-2/12">block</th>
            <th className="px-1 pt-1.5 pb-0.5 w-2/12">table</th>
            <th className="px-1 pt-1.5 pb-0.5 w-[1em]"></th>
            <th className="px-1 pt-1.5 pb-0.5 w-2/12">key</th>
            <th className="px-1 pt-1.5 pb-0.5">value</th>
          </tr>
        </thead>
        <tbody className="font-mono text-xs">
          {storeEvents.map((storeEvent, i) => (
            <tr key={i} className="hover:bg-blue-800">
              <td className="px-1 whitespace-nowrap overflow-hidden text-ellipsis text-white/40">
                {storeEvent.blockNumber}
              </td>
              <td className="px-1 whitespace-nowrap overflow-hidden text-ellipsis">
                {storeEvent.table.namespace}:{storeEvent.table.name}
              </td>
              <td className="px-1 whitespace-nowrap">
                {storeEvent.event === "StoreSetRecord" ? <span className="text-green-500 font-bold">=</span> : null}
                {storeEvent.event === "StoreSetField" ? <span className="text-green-500 font-bold">+</span> : null}
                {storeEvent.event === "StoreDeleteRecord" ? <span className="text-red-500 font-bold">-</span> : null}
              </td>
              <td className="px-1 whitespace-nowrap overflow-hidden text-ellipsis">{storeEvent.keyTuple}</td>
              <td className="px-1 whitespace-nowrap overflow-hidden text-ellipsis">
                {JSON.stringify(storeEvent.namedValues)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
