import { StorageOperation } from "@latticexyz/store-sync";
import { serialize } from "../serialize";
import { EventIcon } from "./EventIcon";
import { StoreConfig } from "@latticexyz/store";

// TODO: use react-table or similar for better perf with lots of logs

type Props = {
  operations: StorageOperation<StoreConfig>[];
};

export function StorageOperationsTable({ operations }: Props) {
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
        {operations.map((operation) => (
          <tr key={operation.id} className="hover:bg-blue-800">
            <td className="px-1 whitespace-nowrap overflow-hidden text-ellipsis text-white/40">
              {operation.log?.blockNumber.toString()}
            </td>
            <td className="px-1 whitespace-nowrap overflow-hidden text-ellipsis">
              {operation.namespace}:{operation.name}
            </td>
            <td className="px-1 whitespace-nowrap overflow-hidden text-ellipsis">{serialize(operation.key)}</td>
            <td className="px-1 whitespace-nowrap">
              <EventIcon type={operation.type} />
            </td>
            <td className="px-1 whitespace-nowrap overflow-hidden text-ellipsis">
              {operation.type === "SetRecord" ? serialize(operation.value) : null}
              {operation.type === "SetField" ? serialize({ [operation.fieldName]: operation.fieldValue }) : null}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
