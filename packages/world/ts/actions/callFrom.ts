import {
  slice,
  concat,
  type Transport,
  type Chain,
  type Account,
  type Hex,
  type WalletActions,
  type EncodeFunctionDataParameters,
  Client,
  PublicActions,
} from "viem";
import { getAction, encodeFunctionData } from "viem/utils";
import { readContract, writeContract as viem_writeContract } from "viem/actions";
import { readHex } from "@latticexyz/common";
import {
  getKeySchema,
  getValueSchema,
  getSchemaTypes,
  decodeValueArgs,
  encodeKey,
} from "@latticexyz/protocol-parser/internal";
import worldConfig from "../../mud.config";
import IStoreReadAbi from "../../out/IStoreRead.sol/IStoreRead.abi.json";

type CallFromParameters = {
  worldAddress: Hex;
  delegatorAddress: Hex;
  worldFunctionToSystemFunction?: (worldFunctionSelector: Hex) => Promise<SystemFunction>;
  publicClient?: Client;
};

type SystemFunction = { systemId: Hex; systemFunctionSelector: Hex };

// By extending viem clients with this function after delegation, the delegation is automatically applied to World contract writes.
// This means that these writes are made on behalf of the delegator.
// Internally, it transforms the write arguments to use `callFrom`.
//
// Accepts either `worldFunctionToSystemFunction` or `publicClient` as an argument.
// `worldFunctionToSystemFunction` allows manually providing the mapping function, thus users can utilize their client store for the lookup.
// If `publicClient` is provided instead, this function retrieves the corresponding system function from the World contract.
//
// The function mapping is cached to avoid redundant retrievals for the same World function.
export function callFrom(
  params: CallFromParameters,
): <chain extends Chain, account extends Account | undefined>(
  client: Client<Transport, chain, account>,
) => Pick<WalletActions<chain, account>, "writeContract"> {
  return (client) => ({
    // Applies to: `client.writeContract`, `getContract(client, ...).write`
    async writeContract(writeArgs) {
      const _writeContract = getAction(client, viem_writeContract, "writeContract");

      // Skip if the contract isn't the World or the function called should not be redirected through `callFrom`.
      if (
        writeArgs.address !== params.worldAddress ||
        writeArgs.functionName === "call" ||
        writeArgs.functionName === "callFrom" ||
        writeArgs.functionName === "callWithSignature"
      ) {
        return _writeContract(writeArgs);
      }

      // Encode the World's calldata (which includes the World's function selector).
      const worldCalldata = encodeFunctionData({
        abi: writeArgs.abi,
        functionName: writeArgs.functionName,
        args: writeArgs.args,
      } as unknown as EncodeFunctionDataParameters);

      // The first 4 bytes of calldata represent the function selector.
      const worldFunctionSelector = slice(worldCalldata, 0, 4);

      // Get the systemId and System's function selector.
      const { systemId, systemFunctionSelector } = await worldFunctionToSystemFunction({
        ...params,
        publicClient: params.publicClient ?? client,
        worldFunctionSelector,
      });

      // Construct the System's calldata by replacing the World's function selector with the System's.
      // Use `readHex` instead of `slice` to prevent out-of-bounds errors with calldata that has no args.
      const systemCalldata = concat([systemFunctionSelector, readHex(worldCalldata, 4)]);

      // Construct args for `callFrom`.
      const callFromArgs: typeof writeArgs = {
        ...writeArgs,
        functionName: "callFrom",
        args: [params.delegatorAddress, systemId, systemCalldata],
      };

      // Call `writeContract` with the new args.
      return _writeContract(callFromArgs);
    },
  });
}

const systemFunctionCache = new Map<Hex, SystemFunction>();

async function worldFunctionToSystemFunction(params: {
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
    abi: IStoreReadAbi,
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
