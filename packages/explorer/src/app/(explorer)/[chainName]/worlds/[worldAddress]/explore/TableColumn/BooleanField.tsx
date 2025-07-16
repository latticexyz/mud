import { Hex } from "viem";
import { useEffect } from "react";
import { Table } from "@latticexyz/config";
import { Checkbox } from "../../../../../../../components/ui/Checkbox";
import { cn } from "../../../../../../../utils";
import { useSetField } from "./useSetField";

type EditableProps = {
  name: string;
  value: boolean;
  table: Table;
  keyTuple: readonly Hex[];
  blockHeight: number;
  disabled?: boolean;
  readOnly?: false;
};

type ReadOnlyProps = {
  value: boolean;
  readOnly: true;
};

type Props = EditableProps | ReadOnlyProps;

function ReadonlyBooleanField(props: ReadOnlyProps) {
  return <Checkbox className="ml-2" checked={props.value} disabled />;
}

function EditableBooleanField({ name, value, table, keyTuple, blockHeight, disabled }: EditableProps) {
  const write = useSetField<Table, never, boolean>({ table, keyTuple, fieldName: name as never });

  useEffect(() => {
    if (write.status === "success" && BigInt(blockHeight) >= write.data.receipt.blockNumber) {
      write.reset();
    }
  }, [write, blockHeight]);

  return (
    <Checkbox
      className={cn("ml-2", write.isPending ? "cursor-wait" : "")}
      checked={write.status === "success" || write.status === "pending" ? write.variables.value : value}
      onCheckedChange={(checked) => {
        if (checked === "indeterminate") return;
        write.mutate({ value: checked });
      }}
      disabled={disabled || write.isPending}
    />
  );
}

export function BooleanField(props: Props) {
  if (props.readOnly) {
    return <ReadonlyBooleanField {...props} />;
  }
  return <EditableBooleanField {...props} />;
}
