import { Hex } from "viem";
import { Table } from "@latticexyz/config";
import { Checkbox } from "../../../../../../components/ui/Checkbox";
import { useSetFieldMutation } from "./useSetFieldMutation";

type Props = {
  name: string;
  value: boolean;
  table: Table;
  keyTuple: readonly Hex[];
  disabled?: boolean;
};

export function BooleanField({ name, value, table, keyTuple, disabled }: Props) {
  const write = useSetFieldMutation<"bool">();
  return (
    <Checkbox
      checked={value}
      onCheckedChange={(checked) => {
        if (checked === "indeterminate") return;
        write.mutate({
          table,
          keyTuple,
          fieldName: name,
          value: checked,
        });
      }}
      disabled={disabled || write.isPending}
    />
  );
}
