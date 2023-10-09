import {
  Abi,
  Account,
  Chain,
  Client,
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

// TODO: migrate away from this approach once we can hook into viem's nonce management: https://github.com/wagmi-dev/viem/discussions/1230

export async function writeContract<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
  TAbi extends Abi | readonly unknown[],
  TFunctionName extends string,
  TChainOverride extends Chain | undefined
>(
  client: Client<Transport, TChain, TAccount>,
  request: WriteContractParameters<TAbi, TFunctionName, TChain, TAccount, TChainOverride>
): Promise<WriteContractReturnType> {
  const rawAccount = request.account ?? client.account;
  if (!rawAccount) {
    // TODO: replace with viem AccountNotFoundError once its exported
    throw new Error("No account provided");
  }
  const account = parseAccount(rawAccount);

  const nonceManager = await getNonceManager({
    client,
    address: account.address,
    blockTag: "pending",
  });

  async function prepareWrite(): Promise<
    WriteContractParameters<TAbi, TFunctionName, TChain, TAccount, TChainOverride>
  > {
    if (request.gas) {
      debug("gas provided, skipping simulate", request.functionName, request.address);
      return request;
    }

    debug("simulating", request.functionName, "at", request.address);
    const result = await simulateContract<TChain, TAbi, TFunctionName, TChainOverride>(client, {
      ...request,
      blockTag: "pending",
      account,
    } as unknown as SimulateContractParameters<TAbi, TFunctionName, TChain, TChainOverride>);

    return result.request as unknown as WriteContractParameters<TAbi, TFunctionName, TChain, TAccount, TChainOverride>;
  }

  const preparedWrite = await prepareWrite();

  return nonceManager.mempoolQueue.add(
    () =>
      pRetry(
        async () => {
          if (!nonceManager.hasNonce()) {
            await nonceManager.resetNonce();
          }

          const nonce = nonceManager.nextNonce();
          debug("calling", preparedWrite.functionName, "with nonce", nonce, "at", preparedWrite.address);
          return await viem_writeContract(client, { nonce, ...preparedWrite } as typeof preparedWrite);
        },
        {
          retries: 3,
          onFailedAttempt: async (error) => {
            // On nonce errors, reset the nonce and retry
            if (nonceManager.shouldResetNonce(error)) {
              debug("got nonce error, retrying", error.message);
              await nonceManager.resetNonce();
              return;
            }
            // TODO: prepareWrite again if there are gas errors?
            throw error;
          },
        }
      ),
    { throwOnTimeout: true }
  );
}
