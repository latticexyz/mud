import { useStoreEvents } from "./useStoreEvents";

export function StoreEvents() {
  const { storeEvents } = useStoreEvents();
  return (
    <table className="w-full table-fixed text-xs font-mono">
      <thead className="sticky top-0 bg-slate-800">
        <th className="px-1 w-2/12 text-left text-slate-500">block</th>
        <th className="px-1 w-1/4 text-left text-slate-500">table</th>
        <th className="px-1 w-[1em]"></th>
        <th className="px-1 w-1/4 text-left text-slate-500">key</th>
        <th className="px-1 text-left text-slate-500">value</th>
      </thead>
      <tbody>
        {storeEvents.map((storeEvent, i) => (
          <tr key={i} className="hover:bg-slate-700">
            <td className="px-1 whitespace-nowrap overflow-hidden text-ellipsis text-slate-500">
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
  );
}
