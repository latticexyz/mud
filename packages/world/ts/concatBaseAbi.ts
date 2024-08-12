import { Abi, AbiItem, toFunctionSignature, toEventSignature } from "viem";
import IBaseWorldAbi from "../out/IBaseWorld.sol/IBaseWorld.abi.json";

function getKey(abiItem: AbiItem): string {
  if (abiItem.type === "function") {
    return toFunctionSignature(abiItem);
  } else if (abiItem.type === "event") {
    return toEventSignature(abiItem);
  } else if ("name" in abiItem) {
    return `${abiItem.type}_${abiItem.name}`;
  }
  return abiItem.type;
}

export function concatBaseAbi(worldAbi: Abi): Abi {
  const baseKeys = IBaseWorldAbi.map(getKey);
  const worldFunctionsAbi = worldAbi.filter((abiItem) => {
    const key = getKey(abiItem);
    return !baseKeys.includes(key);
  });
  const abi = [...IBaseWorldAbi, ...worldFunctionsAbi];

  return abi;
}
