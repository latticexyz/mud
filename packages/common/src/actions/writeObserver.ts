import type {
  WriteContractParameters,
  Transport,
  Chain,
  Account,
  WalletActions,
  WriteContractReturnType,
  Client,
} from "viem";
import { getAction } from "viem/utils";
import { writeContract } from "viem/actions";
import { type ContractWrite } from "../getContract";

type WriteObserverParameters = { onWrite: (write: ContractWrite) => void };

export function writeObserver<chain extends Chain, account extends Account>({
  onWrite,
}: WriteObserverParameters): (
  client: Client<Transport, chain, account>,
) => Pick<WalletActions<chain, account>, "writeContract"> {
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
}
