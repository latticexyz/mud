import { readFileSync } from "fs";
import path from "path";
import { Abi } from "viem";
import { MUDError } from "@latticexyz/common/errors";

/**
 * Load the contract's abi and bytecode from the file system
 * @param contractName: Name of the contract to load
 */
export function getContractData(contractName: string, forgeOutDirectory: string): { bytecode: string; abi: Abi } {
  let data: any;
  const contractDataPath = path.join(forgeOutDirectory, contractName + ".sol", contractName + ".json");
  try {
    data = JSON.parse(readFileSync(contractDataPath, "utf8"));
  } catch (error: any) {
    throw new MUDError(`Error reading file at ${contractDataPath}`);
  }

  const bytecode = data?.bytecode?.object;
  if (!bytecode) throw new MUDError(`No bytecode found in ${contractDataPath}`);

  const abi = data?.abi as Abi;
  if (!abi) throw new MUDError(`No ABI found in ${contractDataPath}`);

  return { abi, bytecode };
}
