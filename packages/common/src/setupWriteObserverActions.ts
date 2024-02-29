import type {
  WriteContractParameters,
  Transport,
  Chain,
  Account,
  WalletActions,
  WalletClient,
  WriteContractReturnType,
} from "viem";
import { getAction } from "viem/utils";
import { writeContract } from "viem/actions";
import { type ContractWrite } from "./getContract";

export const setupWriteObserverActions = <TChain extends Chain, TAccount extends Account>(
  onWrite: (write: ContractWrite) => void
): ((client: WalletClient<Transport, TChain, TAccount>) => Pick<WalletActions<TChain, TAccount>, "writeContract">) => {
  let nextWriteId = 0;

  return (client) => ({
    // Applies to: `client.writeContract`, `getContract(client, ...).write`
    writeContract: (args): Promise<WriteContractReturnType> => {
      const result = getAction(client, writeContract, "writeContract")(args);

      const id = `${client.chain.id}:${client.account.address}:${nextWriteId++}`;
      onWrite({ id, request: args as WriteContractParameters, result });

      return result;
    },
  });
};
