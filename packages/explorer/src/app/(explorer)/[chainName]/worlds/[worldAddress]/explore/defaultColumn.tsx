import { getKeySchema, getKeyTuple } from "@latticexyz/protocol-parser/internal";
import { CellContext, ColumnDef } from "@tanstack/react-table";
import { TDataRow } from "../../../../queries/useTableDataQuery";
import { EditableTableCell } from "./EditableTableCell";

export const defaultColumn: Partial<ColumnDef<TDataRow>> = {
  cell: ({ getValue, row, column, table }: CellContext<TDataRow, unknown>) => {
    const value = getValue();
    const tableConfig = table.options.meta?.tableConfig;
    const isReadOnly = table.options.meta?.isReadOnly;
    const blockHeight = table.options.meta?.blockHeight;

    if (!tableConfig || isReadOnly) return value;
    try {
      const name = column.id;
      const keySchema = getKeySchema(tableConfig);
      if (!table || Object.keys(keySchema).includes(name)) {
        return <div className="px-2 py-4">{value?.toString()}</div>;
      }

      const keyTuple = getKeyTuple(tableConfig, row.original as never);
      return (
        <EditableTableCell
          name={name}
          table={tableConfig}
          value={value}
          keyTuple={keyTuple}
          blockHeight={blockHeight}
        />
      );
    } catch (e) {
      return <div className="px-2 py-4">{value?.toString()}</div>;
    }
  },
};
