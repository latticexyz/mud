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
} from "viem";
import { getAction, encodeFunctionData } from "viem/utils";
import { writeContract } from "viem/actions";

type CallFromParameters = {
  worldAddress: Hex;
  delegatorAddress: Hex;
  worldFunctionToSystemFunction: (
    worldFunctionSelector: Hex,
  ) => Promise<{ systemId: Hex; systemFunctionSelector: Hex }>;
};

// By extending viem clients with this function after delegation, the delegation is automatically
// applied to the World contract writes, meaning these writes are made on behalf of the delegator.
export function callFrom<TChain extends Chain, TAccount extends Account>({
  worldAddress,
  delegatorAddress,
  worldFunctionToSystemFunction,
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
      const { systemId, systemFunctionSelector } = await worldFunctionToSystemFunction(worldFunctionSelector);

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

      return getAction(client, writeContract, "writeContract")(callFromArgs);
    },
  });
}
