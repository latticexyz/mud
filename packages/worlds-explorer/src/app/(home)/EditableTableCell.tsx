import { ChangeEvent, useState } from "react";
// import { encodeValueArgs } from "@latticexyz/protocol-parser/internal";

export function EditableTableCell({ value: defaultValue }: { value: string }) {
  const [value, setValue] = useState(defaultValue);

  const handleChange = (evt: ChangeEvent<HTMLInputElement>) => {
    const value = evt.target.value;
    setValue(value);
  };

  // const encodedValueArgs = encodeValueArgs(
  //   { createdAt: "uint256", completedAt: "uint256", description: "string" },
  //   {
  //     createdAt: BigInt(0),
  //     completedAt: BigInt(12323),
  //     description: "Check",
  //   }
  // );

  return <input className="bg-transparent w-full" onChange={handleChange} defaultValue={value} />;
}
