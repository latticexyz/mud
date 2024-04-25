import { readFileSync } from "fs";
import path from "path";
import { MUDError } from "@latticexyz/common/errors";
import { Abi, Hex, size } from "viem";

/**
 * Load the contract's abi and bytecode from the file system
 * @param contractName: Name of the contract to load
 */
export function getContractData(
  contractName: string,
  forgeOutDirectory: string
): { bytecode: Hex; abi: Abi; deployedBytecodeSize: number } {
  let data: any;
  const contractDataPath = path.join(forgeOutDirectory, contractName + ".sol", contractName + ".json");
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

  return { abi, bytecode, deployedBytecodeSize: size(deployedBytecode as Hex) };
}
