import { Hex } from "viem";
import { useRef, useState } from "react";
import { Table } from "@latticexyz/config";
import { useSetFieldMutation } from "./useSetFieldMutation";

type Props = {
  name: string;
  value: string;
  table: Table;
  keyTuple: readonly Hex[];
  disabled?: boolean;
};

export function TextField({ name, value, table, keyTuple, disabled }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const write = useSetFieldMutation<"string">();
  const [edit, setEdit] = useState<{
    value: string;
    initialValue: string;
  } | null>(null);

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

        console.log(nextValue, latestValue);

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
          table,
          keyTuple,
          fieldName: name,
          value: edit.value,
        });

        // TODO: add back?
        // setEdit(null);
      }}
      aria-label={`Edit ${name} field`}
    >
      <input
        className="bg-transparent px-2 py-4"
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
