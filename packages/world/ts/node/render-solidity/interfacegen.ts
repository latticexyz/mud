import { renderSystemInterface } from "./renderSystemInterface";
import { Abi, Address, Hex, parseAbiItem } from "viem";

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
      const abiItem = parseAbiItem("function " + func.signature);
      if (abiItem.type !== "function") {
        throw new Error();
      }

      return {
        name: abiItem.name,
        parameters: abiItem.inputs.map((input) => input.type),
        stateMutability: "",
        returnParameters: abiItem.outputs.map((input) => input.type),
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
