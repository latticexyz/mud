import { AbiFunction } from "viem";

export function encodeFunctionArgs(args: unknown[], inputs: AbiFunction): unknown[] {
  const encodedArgs = args.map((arg, i) => {
    const input = inputs.inputs[i];
    if (!input || !arg) return arg;

    if (input.type.includes("[]")) return JSON.parse(arg as string);
    if (input.type === "tuple") return JSON.parse(arg as string);
    if (input.type === "bool") return arg === "true";
    if (input.type.startsWith("uint") || input.type.startsWith("int")) {
      if (typeof arg === "string" && arg.endsWith("n")) return arg.slice(0, -1);
      return arg;
    }

    return arg;
  });

  return encodedArgs;
}
