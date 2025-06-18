import { getKeyTuple } from "@latticexyz/protocol-parser/internal";
import { CellContext, ColumnDef } from "@tanstack/react-table";
import { TDataRow } from "../../../../../queries/useTableDataQuery";
import { EditableTableColumn } from "./EditableTableColumn";
import { TableColumn } from "./TableColumn";

export const defaultColumn: Partial<ColumnDef<TDataRow>> = {
  cell: ({ table, column, row, getValue }: CellContext<TDataRow, unknown>) => {
    const name = column.id;
    const value = getValue<TDataRow[string]>();
    const meta = table.options.meta;
    const tableConfig = meta?.tableConfig;
    const isReadOnly = meta?.isReadOnly;
    const blockHeight = meta?.blockHeight;
    const valueSchema = meta?.valueSchema;
    const keySchema = meta?.keySchema;

    const fieldType = valueSchema?.[name as never]?.type;
    const isKey = keySchema && Object.keys(keySchema).includes(name);
    if (!tableConfig || !fieldType || !keySchema || isReadOnly || isKey) {
      return <TableColumn type={fieldType} value={value} />;
    }

    try {
      const keyTuple = getKeyTuple(tableConfig, row.original as never);
      return (
        <EditableTableColumn
          name={name}
          value={value}
          blockHeight={blockHeight}
          fieldType={fieldType}
          tableConfig={tableConfig}
          keyTuple={keyTuple}
        />
      );
    } catch (e) {
      return <TableColumn type={fieldType} value={value} />;
    }
  },
};
