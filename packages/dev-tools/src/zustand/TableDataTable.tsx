import { Table } from "@latticexyz/store";
import { useRecords } from "./useRecords";
import { isHex } from "viem";
import { TruncatedHex } from "../TruncatedHex";
import { FieldValue } from "./FieldValue";

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
          {Object.keys(table.keySchema).map((name) => (
            <th key={name} className="px-1.5 pt-1.5 font-normal">
              {name}
            </th>
          ))}
          {Object.keys(table.valueSchema).map((name) => (
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
              {Object.keys(table.keySchema).map((name) => (
                <td key={name} className="px-1.5 whitespace-nowrap overflow-hidden text-ellipsis">
                  <FieldValue value={record.key[name]} />
                </td>
              ))}
              {Object.keys(table.valueSchema).map((name) => (
                <td key={name} className="px-1.5 whitespace-nowrap overflow-hidden text-ellipsis">
                  <FieldValue value={record.value[name]} />
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
