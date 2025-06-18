import { Hex } from "viem";
import { Table } from "@latticexyz/config";
import { Checkbox } from "../../../../../../../components/ui/Checkbox";
import { useSetFieldMutation } from "./useSetFieldMutation";

type Props = {
  name: string;
  value: boolean;
  tableConfig: Table;
  keyTuple: readonly Hex[];
  blockHeight: number;
  disabled?: boolean;
};

export function ReadonlyBooleanField({ value }: { value: boolean }) {
  return <Checkbox className="ml-2" checked={value} disabled />;
}

export function BooleanField({ name, value, tableConfig, keyTuple, blockHeight, disabled }: Props) {
  const write = useSetFieldMutation<"bool">({ blockHeight });
  return (
    <Checkbox
      className="ml-2"
      checked={write.status === "success" || write.status === "pending" ? write.variables.value : value}
      onCheckedChange={(checked) => {
        if (checked === "indeterminate") return;
        write.mutate({
          tableConfig,
          keyTuple,
          fieldName: name,
          value: checked,
        });
      }}
      disabled={disabled || write.isPending}
    />
  );
}
