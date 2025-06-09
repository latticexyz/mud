import { AbiFunction, Hex, isAddress } from "viem";
import { resolveENS } from "./useENS";

export async function encodeFunctionArgs(args: unknown[], inputs: AbiFunction): Promise<unknown[]> {
  const encodedArgs = await Promise.all(
    args.map(async (arg, i) => {
      const input = inputs.inputs[i];
      if (!input) return arg;

      if (input.type === "tuple") return JSON.parse(arg as string);
      if (input.type === "bool") return arg === "true";
      if (input.type === "address" && typeof arg === "string") {
        if (isAddress(arg)) {
          return arg;
        }

        try {
          const ensData = await resolveENS(arg as Hex);
          if (!ensData.address) {
            throw new Error(`Could not resolve ENS name: ${arg}`);
          }

          if (!isAddress(ensData.address)) {
            throw new Error(`Invalid address resolved from ENS name: ${arg}`);
          }

          return ensData.address;
        } catch (error) {
          console.log("error", error);
          throw new Error(`Failed to resolve ENS name: ${arg}`);
        }
      }

      return arg;
    }),
  );

  return encodedArgs;
}
