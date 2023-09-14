import { StorageAdapterLog } from "@latticexyz/store-sync";
import { EventIcon } from "./EventIcon";
import { hexToTableId } from "@latticexyz/common";

// TODO: use react-table or similar for better perf with lots of logs

type Props = {
  logs: StorageAdapterLog[];
};

export function LogsTable({ logs }: Props) {
  return (
    <table className="w-full table-fixed -mx-1">
      <thead className="sticky top-0 z-10 bg-slate-800 text-amber-200/80 text-left">
        <tr>
          <th className="px-1 pt-1.5 pb-0.5 font-semibold uppercase text-xs w-2/12">block</th>
          <th className="px-1 pt-1.5 pb-0.5 font-semibold uppercase text-xs w-2/12">table</th>
          <th className="px-1 pt-1.5 pb-0.5 font-semibold uppercase text-xs w-2/12">key</th>
          <th className="px-1 pt-1.5 pb-0.5 font-semibold uppercase text-xs w-[1em]"></th>
          <th className="px-1 pt-1.5 pb-0.5 font-semibold uppercase text-xs">value</th>
        </tr>
      </thead>
      <tbody className="font-mono text-xs">
        {logs.map((log) => {
          const { namespace, name } = hexToTableId(log.args.table);
          return (
            <tr
              key={
                log.blockHash != null && log.logIndex != null
                  ? `${log.blockHash}:${log.logIndex}`
                  : `${namespace}:${name}:${log.args.key.join(",")}`
              }
              className="hover:bg-blue-800"
            >
              <td className="px-1 whitespace-nowrap overflow-hidden text-ellipsis text-white/40">
                {log.blockNumber?.toString()}
              </td>
              <td className="px-1 whitespace-nowrap overflow-hidden text-ellipsis">
                {namespace}:{name}
              </td>
              <td className="px-1 whitespace-nowrap overflow-hidden text-ellipsis">{log.args.key.join(",")}</td>
              <td className="px-1 whitespace-nowrap">
                <EventIcon type={log.eventName} />
              </td>
              <td className="px-1 whitespace-nowrap overflow-hidden text-ellipsis">
                {/* TODO: decode these values if we can */}
                {log.eventName === "StoreSetRecord" || log.eventName === "StoreEphemeralRecord"
                  ? JSON.stringify({
                      staticData: log.args.staticData,
                      encodedLengths: log.args.encodedLengths,
                      dynamicData: log.args.dynamicData,
                    })
                  : null}
                {log.eventName === "StoreSpliceStaticRecord"
                  ? JSON.stringify({ start: log.args.start, deleteCount: log.args.deleteCount, data: log.args.data })
                  : null}
                {log.eventName === "StoreSpliceDynamicRecord"
                  ? JSON.stringify({
                      start: log.args.start,
                      deleteCount: log.args.deleteCount,
                      data: log.args.data,
                      encodedLengths: log.args.encodedLengths,
                    })
                  : null}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
