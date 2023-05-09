import { serialize } from "../serialize";
import { StoreEvent } from "../useStore";

// TODO: use react-table or similar for better perf with lots of logs

type Props = {
  events: StoreEvent[];
};

export function EventsTable({ events }: Props) {
  return (
    <table className="w-full table-fixed -mx-1">
      <thead className="sticky top-0 z-10 bg-slate-800 text-amber-200/80 text-left">
        <tr>
          <th className="px-1 pt-1.5 pb-0.5 font-semibold uppercase text-xs w-2/12">block</th>
          <th className="px-1 pt-1.5 pb-0.5 font-semibold uppercase text-xs w-2/12">table</th>
          <th className="px-1 pt-1.5 pb-0.5 font-semibold uppercase text-xs w-[1em]"></th>
          <th className="px-1 pt-1.5 pb-0.5 font-semibold uppercase text-xs w-2/12">key</th>
          <th className="px-1 pt-1.5 pb-0.5 font-semibold uppercase text-xs">value</th>
        </tr>
      </thead>
      <tbody className="font-mono text-xs">
        {events.map((event) => (
          <tr key={`${event.chainId}:${event.blockNumber}:${event.logIndex}`} className="hover:bg-blue-800">
            <td className="px-1 whitespace-nowrap overflow-hidden text-ellipsis text-white/40">{event.blockNumber}</td>
            <td className="px-1 whitespace-nowrap overflow-hidden text-ellipsis">
              {event.table.namespace}:{event.table.name}
            </td>
            <td className="px-1 whitespace-nowrap">
              {event.event === "StoreSetRecord" ? <span className="text-green-500 font-bold">=</span> : null}
              {event.event === "StoreSetField" ? <span className="text-green-500 font-bold">+</span> : null}
              {event.event === "StoreDeleteRecord" ? <span className="text-red-500 font-bold">-</span> : null}
            </td>
            <td className="px-1 whitespace-nowrap overflow-hidden text-ellipsis">{event.keyTuple}</td>
            <td className="px-1 whitespace-nowrap overflow-hidden text-ellipsis">{serialize(event.namedValues)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
