import { AbiType } from "@latticexyz/config";
import { getKeyTuple } from "@latticexyz/protocol-parser/internal";
import { CellContext, ColumnDef } from "@tanstack/react-table";
import { TDataRow } from "../../../../../queries/useTableDataQuery";
import { ReadonlyBooleanField } from "./BooleanField";
import { EditableTableColumn } from "./EditableTableColumn";
import { ReadonlyTextField } from "./TextField";

const TableColumn = ({ type = "string", value }: { type?: AbiType; value: unknown }) => {
  if (type === "bool") {
    return <ReadonlyBooleanField value={value as boolean} />;
  }
  return <ReadonlyTextField value={value as string} />;
};

export const defaultColumn: Partial<ColumnDef<TDataRow>> = {
  cell: ({ table, column, row, getValue }: CellContext<TDataRow, unknown>) => {
    const name = column.id;
    const value = getValue<TDataRow[string]>(); // TODO: can types be tightened?
    const tableConfig = table.options.meta?.tableConfig;
    const isReadOnly = table.options.meta?.isReadOnly;
    const blockHeight = table.options.meta?.blockHeight;
    const valueSchema = table.options.meta?.valueSchema;
    const keySchema = table.options.meta?.keySchema;

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
