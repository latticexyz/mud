import {
  slice,
  concat,
  type WalletClient,
  type Transport,
  type Chain,
  type Account,
  type Hex,
  type WalletActions,
  type WriteContractReturnType,
  type EncodeFunctionDataParameters,
  type PublicClient,
} from "viem";
import { getAction, encodeFunctionData } from "viem/utils";
import { writeContract } from "viem/actions";
import { mapObject } from "@latticexyz/common/utils";
import { getKeySchema, getValueSchema, decodeValueArgs, encodeKey } from "@latticexyz/protocol-parser/internal";
import worldConfig from "../../mud.config";
import IStoreReadAbi from "../../out/IStoreRead.sol/IStoreRead.abi.json";

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

// By extending viem clients with this function after delegation, the delegation is automatically
// applied to the World contract writes, meaning these writes are made on behalf of the delegator.
//
// Accepts either `worldFunctionToSystemFunction` or `publicClient` as an argument.
// If `publicClient` is provided, a read request to the World contract will occur.
export function callFrom<TChain extends Chain, TAccount extends Account>({
  worldAddress,
  delegatorAddress,
  worldFunctionToSystemFunction,
  publicClient,
}: CallFromParameters): (
  client: WalletClient<Transport, TChain, TAccount>,
) => Pick<WalletActions<TChain, TAccount>, "writeContract"> {
  return (client) => ({
    // Applies to: `client.writeContract`, `getContract(client, ...).write`
    writeContract: async (writeArgs): Promise<WriteContractReturnType> => {
      // Skip if the contract isn't the World.
      if (writeArgs.address !== worldAddress) {
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
      const { systemId, systemFunctionSelector } = worldFunctionToSystemFunction
        ? await worldFunctionToSystemFunction(worldFunctionSelector)
        : await retrieveSystemFunction(publicClient, worldAddress, worldFunctionSelector);

      // Construct the System's calldata.
      // If there's no args, use the System's function selector as calldata.
      // Otherwise, use the World's calldata, replacing the World's function selector with the System's.
      const systemCalldata =
        worldCalldata === worldFunctionSelector
          ? systemFunctionSelector
          : concat([systemFunctionSelector, slice(worldCalldata, 4)]);

      // Construct args for `callFrom`.
      const callFromArgs: typeof writeArgs = {
        ...writeArgs,
        functionName: "callFrom",
        args: [delegatorAddress, systemId, systemCalldata],
      };

      // Call `writeContract` with the new args.
      return getAction(client, writeContract, "writeContract")(callFromArgs);
    },
  });
}

const systemFunctionCache = new Map<Hex, SystemFunction>();

async function retrieveSystemFunction(
  publicClient: PublicClient,
  worldAddress: Hex,
  worldFunctionSelector: Hex,
): Promise<SystemFunction> {
  const cacheKey = concat([worldAddress, worldFunctionSelector]);

  // Skip the request if it has been called previously.
  const cached = systemFunctionCache.get(cacheKey);
  if (cached) return cached;

  const table = worldConfig.tables.world__FunctionSelectors;

  const _keySchema = getKeySchema(table);
  const keySchema = mapObject<typeof _keySchema, { [K in keyof typeof _keySchema]: (typeof _keySchema)[K]["type"] }>(
    _keySchema,
    ({ type }) => type,
  );

  const _valueSchema = getValueSchema(table);
  const valueSchema = mapObject<
    typeof _valueSchema,
    { [K in keyof typeof _valueSchema]: (typeof _valueSchema)[K]["type"] }
  >(_valueSchema, ({ type }) => type);

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

  systemFunctionCache.set(cacheKey, systemFunction);

  return systemFunction;
}
