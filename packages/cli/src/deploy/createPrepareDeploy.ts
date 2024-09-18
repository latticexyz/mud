import { DeterministicContract, LibraryPlaceholder, salt } from "./common";
import { spliceHex } from "@latticexyz/common";
import { Hex, getCreate2Address, Address } from "viem";
import { LibraryMap, getLibraryKey } from "./getLibraryMap";

export function createPrepareDeploy(
  bytecodeWithPlaceholders: Hex,
  placeholders: readonly LibraryPlaceholder[],
): DeterministicContract["prepareDeploy"] {
  return function prepareDeploy(deployer: Address, libraryMap: LibraryMap) {
    let bytecode = bytecodeWithPlaceholders;
    for (const placeholder of placeholders) {
      const libraryKey = getLibraryKey(placeholder);
      const library = libraryMap[libraryKey];
      if (!library) {
        throw new Error(`Could not find library for bytecode placeholder ${placeholder.path}:${placeholder.name}`);
      }

      // Store the prepared address in the library map to avoid preparing the same library twice
      library.address ??= library.prepareDeploy(deployer, libraryMap).address;

      bytecode = spliceHex(bytecode, placeholder.start, placeholder.length, library.address);
    }
    return {
      bytecode,
      address: getCreate2Address({ from: deployer, bytecode, salt }),
    };
  };
}
