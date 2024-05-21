import { Abi } from "viem";

export function abigen(systemFunctionSignatures: readonly string[]): Abi {
  const abi = systemFunctionSignatures.map((systemFunctionSignature) => {
    const match = systemFunctionSignature.match(/^([a-zA-Z_]\w*)\((.*)\)$/);
    if (!match) {
      throw new Error("Invalid signature");
    }

    const name = match[1];
    const argsString = match[2];

    const args = argsString.split(",");

    const item = {
      type: "function" as const,
      name,
      inputs: args.map((type, i) => {
        const isTuple = type[0] === "(";
        if (!isTuple) {
          return {
            name: "",
            type,
            internalType: type,
          };
        } else {
          return {
            name: "",
            type: "tuple[]",
            internalType: `${name}${i}Struct[]`,
            components: type
              .replace("(", "")
              .replace(")", "")
              .split(",")
              .map((member, j) => ({
                name: `value${j}`,
                type: member,
                internalType: member,
              })),
          };
        }
      }),
      outputs: [],
      stateMutability: "nonpayable" as const,
    };

    console.log(argsString, item);

    return item;
  });

  return abi;
}
