import { Hex } from "viem";
import { useAccount } from "wagmi";
import { AbiType, Table } from "@latticexyz/config";
import { TDataRow } from "../../../../../queries/useTableDataQuery";
import { BooleanField } from "./BooleanField";
import { TextField } from "./TextField";

type Props = {
  name: string;
  value: TDataRow[string];
  tableConfig: Table;
  keyTuple: readonly Hex[];
  blockHeight?: number;
  fieldType: AbiType;
};

export function EditableTableColumn({ name, value, fieldType, tableConfig, keyTuple, blockHeight = 0 }: Props) {
  const { isConnected } = useAccount();

  if (fieldType === "bool") {
    return (
      <BooleanField
        name={name}
        value={Boolean(value)}
        tableConfig={tableConfig}
        keyTuple={keyTuple}
        blockHeight={blockHeight}
        isReadOnly={!isConnected}
      />
    );
  }

  return (
    <TextField
      name={name}
      value={String(value)}
      tableConfig={tableConfig}
      keyTuple={keyTuple}
      blockHeight={blockHeight}
      isReadOnly={!isConnected}
    />
  );
}
