import { renderSystemInterface } from "./renderSystemInterface";
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

export async function interfacegen(systems: readonly DeployedSystem[]) {
  for (const system of systems) {
    const functions = system.functions.map((func) => {
      const match = func.systemFunctionSignature.match(/^([a-zA-Z_]\w*)\((.*)\)$/);
      if (!match) {
        throw new Error("Invalid signature");
      }

      const name = match[1];
      const argsString = match[2];

      const parameters = argsString
        .split(",")
        .filter((arg) => arg.trim().length > 0)
        .map((parameter, i) => (parameter[0] === "(" ? `${name}${i}Struct` : parameter));

      return {
        name,
        parameters,
        stateMutability: "",
        returnParameters: [],
      };
    });

    const systemInterfaceName = `I${system.name}`;
    const output = renderSystemInterface({
      name: systemInterfaceName,
      functionPrefix: "",
      functions,
      errors: [],
      imports: [],
    });

    console.log(output);
  }
}
