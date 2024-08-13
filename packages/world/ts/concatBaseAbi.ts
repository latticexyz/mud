import { Abi, AbiItem, AbiFunction, toFunctionSelector } from "viem";
import IBaseWorldAbi from "../out/IBaseWorld.sol/IBaseWorld.abi.json";

function isAbiFunction(abiItem: AbiItem): abiItem is AbiFunction {
  return abiItem.type === "function";
}

export function concatBaseAbi(worldAbi: Abi): Abi {
  const baseFunctionSelectors = (IBaseWorldAbi as Abi).filter(isAbiFunction).map(toFunctionSelector);
  const worldFunctionsAbi = worldAbi.filter(
    (abiItem) => !baseFunctionSelectors.includes(toFunctionSelector(abiItem as AbiFunction)),
  );
  const abi = [...IBaseWorldAbi, ...worldFunctionsAbi];

  return abi;
}
