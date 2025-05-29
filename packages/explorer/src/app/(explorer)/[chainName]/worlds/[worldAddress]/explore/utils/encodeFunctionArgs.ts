import { AbiFunction } from "viem";

export function encodeFunctionArgs(values: string[], functionAbi: AbiFunction) {
  return values.map((value, index) => {
    const type = functionAbi.inputs[index]?.type;
    if (type === "tuple") return JSON.parse(value);
    if (type === "bool") return value === "true";
    return value;
  });
}
