import { AbiType } from "@latticexyz/config";
import { BooleanField } from "./BooleanField";
import { TextField } from "./TextField";

type Props = {
  type?: AbiType;
  value: unknown;
};

export function TableColumn({ type = "string", value }: Props) {
  if (type === "bool") {
    return <BooleanField value={value as boolean} isReadOnly />;
  }
  return <TextField value={value as string} isReadOnly />;
}
