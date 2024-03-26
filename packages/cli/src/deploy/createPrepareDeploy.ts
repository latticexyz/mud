import { DeterministicContract, Library, LibraryPlaceholder, salt } from "./common";
import { spliceHex } from "@latticexyz/common";
import { Hex, getCreate2Address, Address } from "viem";

export function createPrepareDeploy(
  bytecodeWithPlaceholders: Hex,
  placeholders: readonly LibraryPlaceholder[],
): DeterministicContract["prepareDeploy"] {
  return function prepareDeploy(deployer: Address, libraries: readonly Library[]) {
    let bytecode = bytecodeWithPlaceholders;
    for (const placeholder of placeholders) {
      const library = libraries.find((lib) => lib.path === placeholder.path && lib.name === placeholder.name);
      if (!library) {
        throw new Error(`Could not find library for bytecode placeholder ${placeholder.path}:${placeholder.name}`);
      }
      bytecode = spliceHex(
        bytecode,
        placeholder.start,
        placeholder.length,
        library.prepareDeploy(deployer, libraries).address,
      );
    }
    return {
      bytecode,
      address: getCreate2Address({ from: deployer, bytecode, salt }),
    };
  };
}
