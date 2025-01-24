import { useRecords } from "./useRecords";
import { FieldValue } from "./FieldValue";
import { Table } from "@latticexyz/store-sync/zustand";

// TODO: use react-table or similar for better perf with lots of logs

type Props = {
  table: Table;
};

export function TableDataTable({ table }: Props) {
  const records = useRecords(table);

  return (
    <table className="w-full -mx-1">
      <thead className="sticky top-0 z-10 bg-slate-800 text-left">
        <tr className="text-amber-200/80 font-mono">
          {Object.keys(table.schema).map((name) => (
            <th key={name} className="px-1.5 pt-1.5 font-normal">
              {name}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="font-mono text-xs">
        {records.map((record) => {
          return (
            <tr key={record.id}>
              {Object.keys(table.schema).map((name) => (
                <td key={name} className="px-1.5 whitespace-nowrap overflow-hidden text-ellipsis">
                  <FieldValue value={record.fields[name]} />
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
