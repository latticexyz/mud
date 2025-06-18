import { Hex } from "viem";
import { Table } from "@latticexyz/config";
import { Checkbox } from "../../../../../../../components/ui/Checkbox";
import { cn } from "../../../../../../../utils";
import { useSetFieldMutation } from "./useSetFieldMutation";
import { useTrackPendingValue } from "./useTrackPendingValue";

type EditableProps = {
  name: string;
  value: boolean;
  tableConfig: Table;
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

function EditableBooleanField(props: EditableProps) {
  const { name, value, tableConfig, keyTuple, blockHeight, disabled } = props;
  const write = useSetFieldMutation<"bool">();
  useTrackPendingValue(write, blockHeight);

  return (
    <Checkbox
      className={cn("ml-2", write.isPending && "cursor-wait")}
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

export function BooleanField(props: Props) {
  if (props.readOnly) {
    return <ReadonlyBooleanField {...props} />;
  }
  return <EditableBooleanField {...props} />;
}
