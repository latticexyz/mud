import { getKeySchema, getKeyTuple } from "@latticexyz/protocol-parser/internal";
import { CellContext, ColumnDef } from "@tanstack/react-table";
import { TDataRow } from "../../../../queries/useTableDataQuery";
import { EditableTableCell } from "./EditableTableCell";

export const defaultColumn: Partial<ColumnDef<TDataRow>> = {
  cell: ({ getValue, row, column, table }: CellContext<TDataRow, unknown>) => {
    const value = getValue();
    const tableConfig = table.options.meta?.tableConfig;

    if (!tableConfig) return value;
    try {
      const name = column.id;
      const keySchema = getKeySchema(tableConfig);
      if (!table || Object.keys(keySchema).includes(name)) {
        return value;
      }

      const keyTuple = getKeyTuple(tableConfig, row.original as never);
      return <EditableTableCell name={name} table={tableConfig} value={value} keyTuple={keyTuple} />;
    } catch (e) {
      return value;
    }
  },
};
