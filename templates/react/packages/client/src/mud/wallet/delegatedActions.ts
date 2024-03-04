import type { WalletClient, Transport, Chain, Account, Hex, WalletActions, WriteContractReturnType } from "viem";
import { getAction, getAbiItem, formatAbiItem, toFunctionSelector, type GetAbiItemParameters } from "viem/utils";
import { writeContract } from "viem/actions";
import { encodeSystemCallFrom, type SystemCallFrom } from "@latticexyz/world";

type DelegatedActionsParameters = {
  worldAddress: Hex;
  delegatorAddress: Hex;
  getSystemId: (functionSelector: Hex) => Hex;
};

// By extending clients with this function after delegation, the delegation automatically applies
// to the World contract writes, meaning these calls are made on behalf of the delegator.
export function delegatedActions<TChain extends Chain, TAccount extends Account>({
  worldAddress,
  delegatorAddress,
  getSystemId,
}: DelegatedActionsParameters): (
  client: WalletClient<Transport, TChain, TAccount>,
) => Pick<WalletActions<TChain, TAccount>, "writeContract"> {
  return (client) => ({
    // Applies to: `client.writeContract`, `getContract(client, ...).write`
    writeContract: (originalArgs): Promise<WriteContractReturnType> => {
      // Skip if the contract isn't the World.
      if (originalArgs.address !== worldAddress) {
        return getAction(client, writeContract, "writeContract")(originalArgs);
      }

      // Ensured not to be `undefined` because of the `writeContract` args type.
      const functionAbiItem = getAbiItem({
        abi: originalArgs.abi,
        name: originalArgs.functionName,
        args: originalArgs.args,
      } as unknown as GetAbiItemParameters)!;

      // `callFrom` requires `systemId`.
      const functionSelector = toFunctionSelector(formatAbiItem(functionAbiItem));
      const systemId = getSystemId(functionSelector);

      // Construct args for `callFrom`.
      const callFromArgs: typeof originalArgs = {
        ...originalArgs,
        functionName: "callFrom",
        args: encodeSystemCallFrom({
          abi: originalArgs.abi,
          from: delegatorAddress,
          systemId,
          functionName: originalArgs.functionName,
          args: originalArgs.args,
        } as unknown as SystemCallFrom),
      };

      return getAction(client, writeContract, "writeContract")(callFromArgs);
    },
  });
}
