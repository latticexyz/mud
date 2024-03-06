import {
  Abi,
  Account,
  Chain,
  Client,
  SimulateContractParameters,
  Transport,
  WriteContractParameters,
  WriteContractReturnType,
  ContractFunctionName,
  ContractFunctionArgs,
} from "viem";
import { simulateContract, writeContract as viem_writeContract } from "viem/actions";
import pRetry from "p-retry";
import { debug as parentDebug } from "./debug";
import { getNonceManager } from "./getNonceManager";
import { parseAccount } from "viem/accounts";

const debug = parentDebug.extend("writeContract");

// TODO: migrate away from this approach once we can hook into viem's nonce management: https://github.com/wagmi-dev/viem/discussions/1230

/** @deprecated Use `walletClient.extend(transactionQueue())` instead. */
export async function writeContract<
  chain extends Chain | undefined,
  account extends Account | undefined,
  abi extends Abi | readonly unknown[],
  functionName extends ContractFunctionName<abi, "nonpayable" | "payable">,
  args extends ContractFunctionArgs<abi, "nonpayable" | "payable", functionName>,
  chainOverride extends Chain | undefined
>(
  client: Client<Transport, chain, account>,
  request: WriteContractParameters<abi, functionName, args, chain, account, chainOverride>
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
    WriteContractParameters<abi, functionName, args, chain, account, chainOverride>
  > {
    if (request.gas) {
      debug("gas provided, skipping simulate", request.functionName, request.address);
      return request;
    }

    debug("simulating", request.functionName, "at", request.address);
    const result = await simulateContract<chain, account, abi, functionName, args, chainOverride>(client, {
      ...request,
      blockTag: "pending",
      account,
    } as unknown as SimulateContractParameters<abi, functionName, args, chain, chainOverride>);

    return result.request as unknown as WriteContractParameters<abi, functionName, args, chain, account, chainOverride>;
  }

  return nonceManager.mempoolQueue.add(
    () =>
      pRetry(
        async () => {
          const preparedWrite = await prepareWrite();

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
