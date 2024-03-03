import {
  encodeFunctionData,
  type WalletClient,
  type Transport,
  type Chain,
  type Account,
  type Hex,
  type WalletActions,
  type WriteContractReturnType,
} from "viem";
import {
  getAction,
  getAbiItem,
  formatAbiItem,
  toFunctionSelector,
  type EncodeFunctionDataParameters,
  type GetAbiItemParameters,
} from "viem/utils";
import { writeContract } from "viem/actions";
import { type Network } from "../setupNetwork";

type DelegatedActionsParameters = { network: Network; delegatorAddress: Hex };

export function delegatedActions<TChain extends Chain, TAccount extends Account>({
  network,
  delegatorAddress,
}: DelegatedActionsParameters): (
  client: WalletClient<Transport, TChain, TAccount>,
) => Pick<WalletActions<TChain, TAccount>, "writeContract"> {
  return (client) => ({
    // Applies to: `client.writeContract`, `getContract(client, ...).write`
    writeContract: (args): Promise<WriteContractReturnType> => {
      if (args.address !== network.worldAddress) return getAction(client, writeContract, "writeContract")(args);

      const functionSelector = toFunctionSelector(
        formatAbiItem(
          getAbiItem({ abi: args.abi, name: args.functionName, args: args.args } as unknown as GetAbiItemParameters)!,
        ),
      );

      const systemId = network.useStore
        .getState()
        .getValue(network.tables.FunctionSelectors, { functionSelector })!.systemId;

      const callFromArgs: typeof args = {
        ...args,
        functionName: "callFrom",
        args: [
          delegatorAddress,
          systemId,
          encodeFunctionData({
            abi: args.abi,
            functionName: args.functionName,
            args: args.args,
          } as unknown as EncodeFunctionDataParameters),
        ],
      };

      return getAction(client, writeContract, "writeContract")(callFromArgs);
    },
  });
}
