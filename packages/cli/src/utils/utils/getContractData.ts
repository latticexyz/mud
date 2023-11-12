import { readFileSync } from "fs";
import path from "path";
import { MUDError } from "@latticexyz/common/errors";
import { Abi, Hex, size } from "viem";
import { PublicLibrary } from "../../deploy/common";

export interface LinkReferences {
  [filename: string]: {
    [name: string]: {
      start: number;
      length: number;
    }[];
  };
}

/**
 * Load the contract's abi and bytecode from the file system
 * @param contractName: Name of the contract to load
 */
export function getContractData(
  filename: string,
  contractName: string,
  forgeOutDirectory: string,
  libraries: PublicLibrary[]
): { bytecode: Hex; abi: Abi; deployedBytecodeSize: number } {
  let data: any;
  const contractDataPath = path.join(forgeOutDirectory, filename, contractName + ".json");
  try {
    data = JSON.parse(readFileSync(contractDataPath, "utf8"));
  } catch (error: any) {
    throw new MUDError(`Error reading file at ${contractDataPath}`);
  }

  const bytecode = data?.bytecode?.object;
  if (!bytecode) throw new MUDError(`No bytecode found in ${contractDataPath}`);
  const linkedBytecode = linkLibraries(bytecode, data?.bytecode?.linkReferences, libraries);

  const deployedBytecode = data?.deployedBytecode?.object;
  if (!deployedBytecode) throw new MUDError(`No deployed bytecode found in ${contractDataPath}`);
  const linkedDeployedBytecode = linkLibraries(deployedBytecode, data?.deployedBytecode?.linkReferences, libraries);

  const abi = data?.abi;
  if (!abi) throw new MUDError(`No ABI found in ${contractDataPath}`);

  return { abi, bytecode: linkedBytecode, deployedBytecodeSize: size(linkedDeployedBytecode as Hex) };
}

function linkLibraries(bytecode: Hex, linkReferences: LinkReferences, libraries: PublicLibrary[]) {
  let result = bytecode;
  for (const [filename, referencedLibraries] of Object.entries(linkReferences)) {
    for (const name of Object.keys(referencedLibraries)) {
      const fullyQualifiedName = `${filename}:${name}`;
      const placeholderData = libraries.find((library) => library.fullyQualifiedName === fullyQualifiedName);
      if (placeholderData === undefined) {
        throw new Error(`Unlinked library ${fullyQualifiedName}`);
      }
      const trimmedAddress = placeholderData.address.slice(2).toLowerCase();
      result = result.replaceAll(placeholderData.addressPlaceholder, trimmedAddress) as Hex;
    }
  }
  return result;
}
