import { Hex } from "viem";
import { useAccount } from "wagmi";
import { Table } from "@latticexyz/config";
import { getValueSchema } from "@latticexyz/protocol-parser/internal";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { TDataRow } from "../../../../queries/useTableDataQuery";
import { BooleanField } from "./BooleanField";
import { TextField } from "./TextField";

type Props = {
  name: string;
  value: TDataRow[string];
  table: Table;
  keyTuple: readonly Hex[];
  blockHeight?: number;
};

export function EditableTableCell({ name, table, keyTuple, value, blockHeight = 0 }: Props) {
  const { openConnectModal } = useConnectModal();
  const account = useAccount();
  const valueSchema = getValueSchema(table);
  const fieldType = valueSchema?.[name as never]?.type;

  if (!account.isConnected) {
    return (
      <div className="cursor-pointer px-2 py-4" onClick={() => openConnectModal?.()}>
        {String(value)}
      </div>
    );
  }

  if (fieldType === "bool") {
    return (
      <BooleanField
        name={name}
        value={Boolean(value)}
        table={table}
        keyTuple={keyTuple}
        blockHeight={blockHeight}
        disabled={!account.isConnected}
      />
    );
  }

  return (
    <TextField
      name={name}
      value={String(value)}
      table={table}
      keyTuple={keyTuple}
      blockHeight={blockHeight}
      disabled={!account.isConnected}
    />
  );
}
