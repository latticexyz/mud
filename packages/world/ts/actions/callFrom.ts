import {
  slice,
  concat,
  type Transport,
  type Chain,
  type Account,
  type Hex,
  type WalletActions,
  type WriteContractReturnType,
  type EncodeFunctionDataParameters,
  type PublicClient,
  Client,
} from "viem";
import { getAction, encodeFunctionData } from "viem/utils";
import { writeContract } from "viem/actions";
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

// Accepts either `worldFunctionToSystemFunction` or `publicClient`, but not both.
type CallFromParameters = CallFromFunctionParameters | CallFromClientParameters;
type CallFromBaseParameters = {
  worldAddress: Hex;
  delegatorAddress: Hex;
};
type CallFromFunctionParameters = CallFromBaseParameters & {
  worldFunctionToSystemFunction: (worldFunctionSelector: Hex) => Promise<SystemFunction>;
  publicClient?: never;
};
type CallFromClientParameters = CallFromBaseParameters & {
  worldFunctionToSystemFunction?: never;
  publicClient: PublicClient;
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
export function callFrom<TChain extends Chain, TAccount extends Account>(
  params: CallFromParameters,
): (client: Client<Transport, TChain, TAccount>) => Pick<WalletActions<TChain, TAccount>, "writeContract"> {
  return (client) => ({
    // Applies to: `client.writeContract`, `getContract(client, ...).write`
    writeContract: async (writeArgs): Promise<WriteContractReturnType> => {
      // Skip if the contract isn't the World or the function called should not be redirected through `callFrom`.
      if (
        writeArgs.address !== params.worldAddress ||
        writeArgs.functionName === "call" ||
        writeArgs.functionName === "callFrom" ||
        writeArgs.functionName === "callWithSignature"
      ) {
        return getAction(client, writeContract, "writeContract")(writeArgs);
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
      const { systemId, systemFunctionSelector } = await worldFunctionToSystemFunction(params, worldFunctionSelector);

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
      return getAction(client, writeContract, "writeContract")(callFromArgs);
    },
  });
}

const systemFunctionCache = new Map<Hex, SystemFunction>();

async function worldFunctionToSystemFunction(
  params: CallFromParameters,
  worldFunctionSelector: Hex,
): Promise<SystemFunction> {
  const cacheKey = concat([params.worldAddress, worldFunctionSelector]);

  // Use cache if the function has been called previously.
  const cached = systemFunctionCache.get(cacheKey);
  if (cached) return cached;

  // If a mapping function is provided, use it. Otherwise, call the World contract.
  const systemFunction = params.worldFunctionToSystemFunction
    ? await params.worldFunctionToSystemFunction(worldFunctionSelector)
    : await retrieveSystemFunctionFromContract(params.publicClient, params.worldAddress, worldFunctionSelector);

  systemFunctionCache.set(cacheKey, systemFunction);

  return systemFunction;
}

async function retrieveSystemFunctionFromContract(
  publicClient: PublicClient,
  worldAddress: Hex,
  worldFunctionSelector: Hex,
): Promise<SystemFunction> {
  const table = worldConfig.tables.world__FunctionSelectors;

  const keySchema = getSchemaTypes(getKeySchema(table));
  const valueSchema = getSchemaTypes(getValueSchema(table));

  const [staticData, encodedLengths, dynamicData] = await publicClient.readContract({
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
