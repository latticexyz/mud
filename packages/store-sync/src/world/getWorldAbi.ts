import { Client, Abi, Address, getAddress, toFunctionSelector, hexToString, parseAbi, stringToHex } from "viem";
import IBaseWorldAbi from "@latticexyz/world/out/IBaseWorld.sol/IBaseWorld.abi.json" with { type: "json" };
import metadataConfig from "@latticexyz/world-module-metadata/mud.config";
import { functionSignatureToAbiItem } from "./functionSignatureToAbiItem";
import { isDefined } from "@latticexyz/common/utils";
import { getFunctions } from "./getFunctions";
import { getRecords } from "../getRecords";
import { isAbiFunction } from "./common";

export async function getWorldAbi({
  client,
  worldAddress,
  fromBlock,
  toBlock,
  indexerUrl,
  chainId,
}: {
  readonly client: Client;
  readonly worldAddress: Address;
  readonly fromBlock?: bigint;
  readonly toBlock?: bigint;
  readonly indexerUrl?: string;
  readonly chainId?: number;
}): Promise<Abi> {
  const [worldFunctions, { records }] = await Promise.all([
    getFunctions({
      client,
      worldAddress: getAddress(worldAddress),
      fromBlock,
      toBlock,
      indexerUrl,
      chainId,
    }),
    getRecords({
      table: metadataConfig.tables.metadata__ResourceTag,
      worldAddress,
      chainId,
      indexerUrl,
      client,
      fromBlock,
      toBlock,
    }),
  ]);

  const metadataAbi = records
    .filter(({ tag }) => tag === stringToHex("worldAbi", { size: 32 }))
    .flatMap(({ value }) => (value === "0x" ? [] : parseAbi(hexToString(value).split("\n"))));

  const metadataFunctionSelectors = metadataAbi.filter(isAbiFunction).map(toFunctionSelector);
  const baseFunctionSelectors = (IBaseWorldAbi as Abi).filter(isAbiFunction).map(toFunctionSelector);
  const worldFunctionsAbi = worldFunctions
    .map((func) => {
      try {
        return functionSignatureToAbiItem(func.signature);
      } catch (error) {
        console.error(error);
      }
    })
    .filter(isDefined)
    .filter(
      (abiItem) =>
        !baseFunctionSelectors.includes(toFunctionSelector(abiItem)) &&
        !metadataFunctionSelectors.includes(toFunctionSelector(abiItem)),
    );

  return [...(IBaseWorldAbi as Abi), ...metadataAbi, ...worldFunctionsAbi];
}
