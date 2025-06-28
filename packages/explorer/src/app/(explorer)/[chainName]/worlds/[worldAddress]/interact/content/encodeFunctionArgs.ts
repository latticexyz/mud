import { AbiFunction } from "viem";

export function encodeFunctionArgs(args: unknown[], inputs: AbiFunction): unknown[] {
  const encodedArgs = args.map((arg, i) => {
    const input = inputs.inputs[i];
    if (!input || !arg) return arg;

    if (input.type.includes("[]")) return JSON.parse(arg as string);
    if (input.type === "tuple") return JSON.parse(arg as string);
    if (input.type === "bool") return arg === "true";

    if (input.type.startsWith("uint") || input.type.startsWith("int")) {
      const argStr = String(arg).trim();

      // Handle values ending with "n" (BigInt notation)
      if (argStr.endsWith("n")) {
        const numericPart = argStr.slice(0, -1);
        return BigInt(numericPart);
      }

      // Handle regular numeric strings
      if (argStr === "") return 0n;

      // Remove any non-numeric characters except minus sign and decimal point
      const cleanArg = argStr.replace(/[^\d.-]/g, "");
      if (cleanArg === "" || cleanArg === "-" || cleanArg === ".") return 0n;

      // Handle decimal numbers by truncating to integer
      if (cleanArg.includes(".")) {
        const [integerPart] = cleanArg.split(".");
        return BigInt(integerPart || "0");
      }

      return BigInt(cleanArg);
    }

    return arg;
  });

  return encodedArgs;
}
