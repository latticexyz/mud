import { AbiFunction } from "viem";

export function encodeFunctionArgs(args: unknown[], inputs: AbiFunction): unknown[] {
  const encodedArgs = args.map((arg, i) => {
    const input = inputs.inputs[i];
    if (!input || !arg) return arg;

    if (input.type.includes("[]")) return JSON.parse(arg as string);
    if (input.type === "tuple") return JSON.parse(arg as string);
    if (input.type === "bool") return arg === "true";

    return arg;
  });

  return encodedArgs;
}
