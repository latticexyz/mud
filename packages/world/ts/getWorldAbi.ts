import { Client, Abi, Address, getAddress } from "viem";
import IBaseWorldAbi from "../out/IBaseWorld.sol/IBaseWorld.abi.json";
import { functionSignatureToAbiItem } from "./functionSignatureToAbiItem";
import { getFunctions } from "./getFunctions";

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
  const worldFunctionsAbi = worldFunctions.map((func) => functionSignatureToAbiItem(func.signature));
  const abi = [...IBaseWorldAbi, ...worldFunctionsAbi];

  return abi;
}
