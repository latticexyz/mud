import { Client, Abi, AbiItem, AbiFunction, Address, getAddress, toFunctionSelector } from "viem";
import IBaseWorldAbi from "../out/IBaseWorld.sol/IBaseWorld.abi.json";
import { functionSignatureToAbiItem } from "./functionSignatureToAbiItem";
import { getFunctions } from "./getFunctions";

function isAbiFunction(abiItem: AbiItem): abiItem is AbiFunction {
  return abiItem.type === "function";
}

export async function getWorldAbi({
  client,
  worldAddress,
  fromBlock,
  toBlock,
}: {
  readonly client: Client;
  readonly worldAddress: Address;
  readonly fromBlock: bigint;
  readonly toBlock: bigint;
}): Promise<Abi> {
  const worldFunctions = await getFunctions({
    client,
    worldAddress: getAddress(worldAddress),
    fromBlock,
    toBlock,
  });
  const baseFunctionSelectors = (IBaseWorldAbi as Abi).filter(isAbiFunction).map(toFunctionSelector);
  const worldFunctionsAbi = worldFunctions
    .map((func) => functionSignatureToAbiItem(func.signature))
    .filter((abiItem) => !baseFunctionSelectors.includes(toFunctionSelector(abiItem)));
  const abi = [...IBaseWorldAbi, ...worldFunctionsAbi];

  return abi;
}
