import { DeterministicContract, LibraryPlaceholder } from "./common";
import { spliceHex } from "@latticexyz/common";
import { Hex, Address } from "viem";
import { LibraryMap } from "./getLibraryMap";
import { getContractAddress } from "@latticexyz/common/internal";

export function createPrepareDeploy(
  bytecodeWithPlaceholders: Hex,
  placeholders: readonly LibraryPlaceholder[],
): DeterministicContract["prepareDeploy"] {
  return function prepareDeploy(deployerAddress: Address, libraryMap?: LibraryMap) {
    let bytecode = bytecodeWithPlaceholders;

    if (placeholders.length === 0) {
      return { bytecode, address: getContractAddress({ deployerAddress, bytecode }) };
    }

    if (!libraryMap) {
      throw new Error("Libraries must be provided if there are placeholders");
    }

    for (const placeholder of placeholders) {
      const address = libraryMap.getAddress({
        name: placeholder.name,
        path: placeholder.path,
        deployer: deployerAddress,
      });
      bytecode = spliceHex(bytecode, placeholder.start, placeholder.length, address);
    }
    return {
      bytecode,
      address: getContractAddress({ deployerAddress, bytecode }),
    };
  };
}
