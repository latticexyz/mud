import { Abi, Address, Hex } from "viem";

type DeterministicContract = {
  readonly prepareDeploy: (
    deployer: Address,
    libraries: readonly Library[],
  ) => {
    readonly address: Address;
    readonly bytecode: Hex;
  };
  readonly deployedBytecodeSize: number;
  readonly abi: Abi;
};

type Library = DeterministicContract & {
  /**
   * Path to library source file, e.g. `src/libraries/SomeLib.sol`
   */
  path: string;
  /**
   * Library name, e.g. `SomeLib`
   */
  name: string;
};

// map over each and decode signature
type WorldFunction = {
  readonly signature: string;
  readonly selector: Hex;
  readonly systemId: Hex;
  readonly systemFunctionSignature: string;
  readonly systemFunctionSelector: Hex;
};

type System = DeterministicContract & {
  readonly namespace: string;
  readonly name: string;
  readonly systemId: Hex;
  readonly allowAll: boolean;
  readonly allowedAddresses: readonly Hex[];
  readonly allowedSystemIds: readonly Hex[];
  readonly functions: readonly WorldFunction[];
};

type DeployedSystem = Omit<System, "abi" | "prepareDeploy" | "deployedBytecodeSize" | "allowedSystemIds"> & {
  address: Address;
};

export function abigen(system: DeployedSystem): Abi {
  const abi = system.functions.map((func) => {
    const match = func.systemFunctionSignature.match(/^([a-zA-Z_]\w*)\((.*)\)$/);
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
