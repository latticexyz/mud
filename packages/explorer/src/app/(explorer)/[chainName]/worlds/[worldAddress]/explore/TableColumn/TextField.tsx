import { Hex } from "viem";
import { useRef, useState } from "react";
import { Table } from "@latticexyz/config";
import { cn } from "../../../../../../../utils";
import { useSetFieldMutation } from "./useSetFieldMutation";

type EditableProps = {
  name: string;
  value: string;
  tableConfig: Table;
  keyTuple: readonly Hex[];
  blockHeight: number;
  isReadOnly?: false;
  disabled?: boolean;
};

type ReadOnlyProps = {
  value: string;
  isReadOnly: true;
};

type Props = EditableProps | ReadOnlyProps;

function ReadonlyTextField(props: ReadOnlyProps) {
  return <div className="px-2 py-4">{props.value}</div>;
}

function EditableTextField(props: EditableProps) {
  const { name, value, tableConfig, keyTuple, blockHeight, disabled } = props;
  const formRef = useRef<HTMLFormElement>(null);
  const [edit, setEdit] = useState<{ value: string; initialValue: string } | null>(null);
  const write = useSetFieldMutation<"string">({
    blockHeight,
    reset: () => setEdit(null),
  });

  const latestValue = write.status === "success" ? write.variables.value : value;
  return (
    <form
      ref={formRef}
      onSubmit={(event) => {
        event.preventDefault();

        if (!edit) return;

        const formData = new FormData(event.currentTarget);
        const nextValue = formData.get(name);
        if (typeof value !== "string") return;

        // Skip if our input hasn't changed from the indexer value
        if (nextValue === latestValue) {
          setEdit(null);
          return;
        }

        // Indexer value changed while we were editing, so we might
        // be at risk of overwriting a change from somewhere else.
        if (edit.initialValue !== latestValue) {
          const confirm = window.confirm("Value changed while editing. Are you sure you want to overwrite it?");
          if (!confirm) {
            setEdit(null);
            return;
          }
        }

        write.mutate({
          tableConfig,
          keyTuple,
          fieldName: name,
          value: edit.value,
        });
      }}
    >
      <input
        className={cn("bg-transparent px-2 py-4", write.isPending && "cursor-wait")}
        name={name}
        value={edit ? edit.value : latestValue}
        onFocus={(event) => setEdit({ value: event.currentTarget.value, initialValue: latestValue })}
        onChange={(event) => {
          const nextValue = event.currentTarget.value;
          setEdit((state) => ({
            value: nextValue,
            initialValue: state?.initialValue ?? latestValue,
          }));
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.currentTarget.blur();
          } else if (event.key === "Escape") {
            setEdit(null);
          }
        }}
        onBlur={() => formRef.current?.requestSubmit()}
        disabled={disabled || write.isPending}
      />
    </form>
  );
}

export function TextField(props: Props) {
  if (props.isReadOnly) {
    return <ReadonlyTextField {...props} />;
  }

  return <EditableTextField {...props} />;
}
