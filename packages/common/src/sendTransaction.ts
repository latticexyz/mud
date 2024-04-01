import {
  Account,
  CallParameters,
  Chain,
  Client,
  SendTransactionParameters,
  Transport,
  SendTransactionReturnType,
  PublicClient,
} from "viem";
import { call, sendTransaction as viem_sendTransaction } from "viem/actions";
import pRetry from "p-retry";
import { debug as parentDebug } from "./debug";
import { getNonceManager } from "./getNonceManager";
import { parseAccount } from "viem/accounts";

const debug = parentDebug.extend("sendTransaction");

// TODO: migrate away from this approach once we can hook into viem's nonce management: https://github.com/wagmi-dev/viem/discussions/1230

/** @deprecated Use `walletClient.extend(transactionQueue())` instead. */
export async function sendTransaction<
  chain extends Chain | undefined,
  account extends Account | undefined,
  chainOverride extends Chain | undefined,
>(
  client: Client<Transport, chain, account>,
  request: SendTransactionParameters<chain, account, chainOverride>,
  publicClient?: PublicClient<Transport, chain>,
): Promise<SendTransactionReturnType> {
  const rawAccount = request.account ?? client.account;
  if (!rawAccount) {
    // TODO: replace with viem AccountNotFoundError once its exported
    throw new Error("No account provided");
  }
  const account = parseAccount(rawAccount);

  const nonceManager = await getNonceManager({
    client: publicClient ?? client,
    address: account.address,
    blockTag: "pending",
  });

  async function prepare(): Promise<SendTransactionParameters<chain, account, chainOverride>> {
    if (request.gas) {
      debug("gas provided, skipping simulate", request.to);
      return request;
    }

    debug("simulating tx to", request.to);
    await call(publicClient ?? client, {
      ...request,
      blockTag: "pending",
      account,
    } as CallParameters<chain>);

    return request;
  }

  return await nonceManager.mempoolQueue.add(
    () =>
      pRetry(
        async () => {
          const preparedRequest = await prepare();

          if (!nonceManager.hasNonce()) {
            await nonceManager.resetNonce();
          }

          const nonce = nonceManager.nextNonce();
          debug("sending tx with nonce", nonce, "to", preparedRequest.to);
          const parameters: SendTransactionParameters<chain, account, chainOverride> = { nonce, ...preparedRequest };
          return await viem_sendTransaction(client, parameters);
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
            // TODO: prepare again if there are gas errors?
            throw error;
          },
        },
      ),
    { throwOnTimeout: true },
  );
}
