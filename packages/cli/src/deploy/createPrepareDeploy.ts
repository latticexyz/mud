import { DeterministicContract, LibraryPlaceholder, salt } from "./common";
import { spliceHex } from "@latticexyz/common";
import { Hex, getCreate2Address, Address } from "viem";
import { LibraryMap } from "./getLibraryMap";

export function createPrepareDeploy(
  bytecodeWithPlaceholders: Hex,
  placeholders: readonly LibraryPlaceholder[],
): DeterministicContract["prepareDeploy"] {
  return function prepareDeploy(deployer: Address, libraryMap?: LibraryMap) {
    let bytecode = bytecodeWithPlaceholders;

    if (placeholders.length === 0) {
      return { bytecode, address: getCreate2Address({ from: deployer, bytecode, salt }) };
    }

    if (!libraryMap) {
      throw new Error("Libraries must be provided if there are placeholders");
    }

    for (const placeholder of placeholders) {
      const address = libraryMap.getAddress({ name: placeholder.name, path: placeholder.path, deployer });
      bytecode = spliceHex(bytecode, placeholder.start, placeholder.length, address);
    }
    return {
      bytecode,
      address: getCreate2Address({ from: deployer, bytecode, salt }),
    };
  };
}
