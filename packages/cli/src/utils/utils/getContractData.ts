import { readFileSync } from "fs";
import path from "path";
import { MUDError } from "@latticexyz/common/errors";
import { Abi, Hex, size } from "viem";
import { LibraryPlaceholder } from "../../deploy/common";

export type LinkReferences = {
  [filename: string]: {
    [name: string]: {
      start: number;
      length: number;
    }[];
  };
};

/**
 * Load the contract's abi and bytecode from the file system
 * @param contractName: Name of the contract to load
 */
export function getContractData(
  filename: string,
  contractName: string,
  forgeOutDirectory: string,
): { bytecode: Hex; placeholders: readonly LibraryPlaceholder[]; abi: Abi; deployedBytecodeSize: number } {
  let data: any;
  const contractDataPath = path.join(forgeOutDirectory, filename, contractName + ".json");
  try {
    data = JSON.parse(readFileSync(contractDataPath, "utf8"));
  } catch (error: any) {
    throw new MUDError(`Error reading file at ${contractDataPath}`);
  }

  const bytecode = data?.bytecode?.object;
  if (!bytecode) throw new MUDError(`No bytecode found in ${contractDataPath}`);

  const deployedBytecode = data?.deployedBytecode?.object;
  if (!deployedBytecode) throw new MUDError(`No deployed bytecode found in ${contractDataPath}`);

  const abi = data?.abi;
  if (!abi) throw new MUDError(`No ABI found in ${contractDataPath}`);

  const placeholders = Object.entries((data?.bytecode?.linkReferences ?? {}) as LinkReferences).flatMap(
    ([path, contracts]) =>
      Object.entries(contracts).flatMap(([contractName, locations]) =>
        locations.map((location) => ({
          path,
          name: contractName,
          start: location.start,
          length: location.length,
        })),
      ),
  );

  return { abi, bytecode, placeholders, deployedBytecodeSize: size(deployedBytecode as Hex) };
}
