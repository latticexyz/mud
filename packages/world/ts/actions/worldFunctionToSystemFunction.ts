import {
  getSchemaTypes,
  getKeySchema,
  getValueSchema,
  encodeKey,
  decodeValueArgs,
} from "@latticexyz/protocol-parser/internal";
import { Client, concat, Hex, PublicActions } from "viem";
import { readContract } from "viem/actions";
import { getAction } from "viem/utils";
import worldConfig from "../../mud.config";

export type SystemFunction = { systemId: Hex; systemFunctionSelector: Hex };

const systemFunctionCache = new Map<Hex, SystemFunction>();

export async function worldFunctionToSystemFunction(params: {
  worldAddress: Hex;
  delegatorAddress: Hex;
  worldFunctionSelector: Hex;
  worldFunctionToSystemFunction?: (worldFunctionSelector: Hex) => Promise<SystemFunction>;
  publicClient: Client;
}): Promise<SystemFunction> {
  const cacheKey = concat([params.worldAddress, params.worldFunctionSelector]);

  // Use cache if the function has been called previously.
  const cached = systemFunctionCache.get(cacheKey);
  if (cached) return cached;

  // If a mapping function is provided, use it. Otherwise, call the World contract.
  const systemFunction = params.worldFunctionToSystemFunction
    ? await params.worldFunctionToSystemFunction(params.worldFunctionSelector)
    : await retrieveSystemFunctionFromContract(params.publicClient, params.worldAddress, params.worldFunctionSelector);

  systemFunctionCache.set(cacheKey, systemFunction);

  return systemFunction;
}

async function retrieveSystemFunctionFromContract(
  publicClient: Client,
  worldAddress: Hex,
  worldFunctionSelector: Hex,
): Promise<SystemFunction> {
  const table = worldConfig.tables.world__FunctionSelectors;

  const keySchema = getSchemaTypes(getKeySchema(table));
  const valueSchema = getSchemaTypes(getValueSchema(table));

  const _readContract = getAction(publicClient, readContract, "readContract") as PublicActions["readContract"];

  const [staticData, encodedLengths, dynamicData] = await _readContract({
    address: worldAddress,
    abi: [
      {
        type: "function",
        name: "getRecord",
        inputs: [
          {
            name: "tableId",
            type: "bytes32",
            internalType: "ResourceId",
          },
          {
            name: "keyTuple",
            type: "bytes32[]",
            internalType: "bytes32[]",
          },
        ],
        outputs: [
          {
            name: "staticData",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "encodedLengths",
            type: "bytes32",
            internalType: "EncodedLengths",
          },
          {
            name: "dynamicData",
            type: "bytes",
            internalType: "bytes",
          },
        ],
        stateMutability: "view",
      },
    ],
    functionName: "getRecord",
    args: [table.tableId, encodeKey(keySchema, { worldFunctionSelector })],
  });

  const decoded = decodeValueArgs(valueSchema, { staticData, encodedLengths, dynamicData });

  const systemFunction: SystemFunction = {
    systemId: decoded.systemId,
    systemFunctionSelector: decoded.systemFunctionSelector,
  };

  return systemFunction;
}
