import {
  Abi,
  Account,
  Chain,
  Client,
  Hex,
  SimulateContractParameters,
  Transport,
  WriteContractParameters,
  WriteContractReturnType,
} from "viem";
import { simulateContract, writeContract as viem_writeContract } from "viem/actions";
import pRetry from "p-retry";
import { debug as parentDebug } from "./debug";
import { getNonceManager } from "./getNonceManager";
import { parseAccount } from "viem/accounts";

const debug = parentDebug.extend("writeContract");
let nextWriteId = 0;

export type ContractWrite<
  TAbi extends Abi | readonly unknown[] = Abi,
  TFunctionName extends string = string,
  TChain extends Chain | undefined = Chain,
  TAccount extends Account | undefined = Account | undefined,
  TChainOverride extends Chain | undefined = Chain | undefined
> = {
  id: string;
  request: WriteContractParameters<TAbi, TFunctionName, TChain, TAccount, TChainOverride>;
  result: Promise<Hex>;
};

export type WriteContractOptions<
  TAbi extends Abi | readonly unknown[] = Abi,
  TFunctionName extends string = string,
  TChain extends Chain | undefined = Chain,
  TAccount extends Account | undefined = Account | undefined,
  TChainOverride extends Chain | undefined = Chain | undefined
> = WriteContractParameters<TAbi, TFunctionName, TChain, TAccount, TChainOverride> & {
  onWrite?: (write: ContractWrite<TAbi, TFunctionName, TChain, TAccount, TChainOverride>) => void;
};

export async function writeContract<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
  TAbi extends Abi | readonly unknown[],
  TFunctionName extends string,
  TChainOverride extends Chain | undefined
>(
  client: Client<Transport, TChain, TAccount>,
  { onWrite, ...request_ }: WriteContractOptions<TAbi, TFunctionName, TChain, TAccount, TChainOverride>
): Promise<WriteContractReturnType> {
  const request = request_ as WriteContractParameters<TAbi, TFunctionName, TChain, TAccount, TChainOverride>;

  const account_ = request.account ?? client.account;
  if (!account_) {
    // TODO: replace with viem AccountNotFoundError once its exported
    throw new Error("No account provided");
  }
  const account = parseAccount(account_);

  const nonceManager = await getNonceManager({
    client,
    address: account.address,
  });

  async function prepareWrite(): Promise<
    WriteContractParameters<TAbi, TFunctionName, TChain, TAccount, TChainOverride>
  > {
    if (request.gas) {
      debug("gas provided, skipping simulate", request);
      return request;
    }

    debug("simulating write", request);
    const result = await simulateContract<TChain, TAbi, TFunctionName, TChainOverride>(client, {
      ...request,
      account,
    } as unknown as SimulateContractParameters<TAbi, TFunctionName, TChain, TChainOverride>);

    return result.request as unknown as WriteContractParameters<TAbi, TFunctionName, TChain, TAccount, TChainOverride>;
  }

  async function write(): Promise<Hex> {
    const preparedWrite = await prepareWrite();

    return await pRetry(
      async () => {
        if (!nonceManager.hasNonce()) {
          await nonceManager.resetNonce();
        }

        const nonce = nonceManager.nextNonce();
        debug("calling write function with nonce", nonce, preparedWrite);
        return await viem_writeContract(client, { nonce, ...preparedWrite });
      },
      {
        retries: 3,
        onFailedAttempt: async (error) => {
          // On nonce errors, reset the nonce and retry
          if (nonceManager.shouldResetNonce(error)) {
            debug("got nonce error, retrying", error);
            await nonceManager.resetNonce();
            return;
          }
          // TODO: prepareWrite again if there are gas errors?
          throw error;
        },
      }
    );
  }

  const result = write();

  onWrite?.({ id: `${nextWriteId++}`, request, result });

  return result;
}
