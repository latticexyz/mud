import { DeterministicContract, LibraryPlaceholder, salt } from "./common";
import { spliceHex } from "@latticexyz/common";
import { Hex, getCreate2Address, Address } from "viem";
import { LibraryMap } from "./getLibraryMap";

export function createPrepareDeploy(
  bytecodeWithPlaceholders: Hex,
  placeholders: readonly LibraryPlaceholder[],
): DeterministicContract["prepareDeploy"] {
  return function prepareDeploy(deployer: Address, libraryMap: LibraryMap) {
    let bytecode = bytecodeWithPlaceholders;
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
