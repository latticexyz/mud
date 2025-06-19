import { Hex } from "viem";
import { useEffect, useState } from "react";
import { Table } from "@latticexyz/config";
import { cn } from "../../../../../../../utils";
import { useSetField } from "./useSetField";

type EditableProps = {
  name: string;
  value: string;
  table: Table;
  keyTuple: readonly Hex[];
  blockHeight: number;
  readOnly?: false;
  disabled?: boolean;
};

type ReadOnlyProps = {
  value: string;
  readOnly: true;
};

type Props = EditableProps | ReadOnlyProps;

function ReadonlyTextField(props: ReadOnlyProps) {
  return <div className="px-2 py-4">{props.value}</div>;
}

function EditableTextField({ name, value, table, keyTuple, blockHeight, disabled }: EditableProps) {
  const write = useSetField<Table, never, string>({ table, keyTuple, fieldName: name as never });
  useEffect(() => {
    if (write.status === "success" && BigInt(blockHeight) >= write.data.receipt.blockNumber) {
      write.reset();
    }
  }, [write, blockHeight]);

  const [edit, setEdit] = useState<{ value: string; initialValue: string } | null>(null);
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();

        if (!edit) return;

        // Skip if our input hasn't changed from the indexer value
        if (edit.value === value) {
          setEdit(null);
          return;
        }

        // Indexer value changed while we were editing, so we might
        // be at risk of overwriting a change from somewhere else.
        if (edit.initialValue !== value) {
          if (
            !window.confirm("The value of this field changed while editing. Are you sure you want to overwrite it?")
          ) {
            setEdit(null);
            return;
          }
        }

        write.mutate({ value: edit.value });
        setEdit(null);
      }}
    >
      <input
        className={cn("bg-transparent px-2 py-4", write.isPending && "cursor-wait")}
        name={name}
        value={edit ? edit.value : write.status !== "idle" ? String(write.variables.value) : value}
        onFocus={(event) => setEdit({ value: event.currentTarget.value, initialValue: value })}
        onChange={(event) => {
          const nextValue = event.currentTarget.value;
          setEdit((state) => ({
            value: nextValue,
            initialValue: state?.initialValue ?? value,
          }));
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.currentTarget.blur();
          } else if (event.key === "Escape") {
            setEdit(null);
          }
        }}
        onBlur={(event) => event.currentTarget.form?.requestSubmit()}
        disabled={disabled || write.isPending}
      />
    </form>
  );
}

export function TextField(props: Props) {
  if (props.readOnly) {
    return <ReadonlyTextField {...props} />;
  }
  return <EditableTextField {...props} />;
}
