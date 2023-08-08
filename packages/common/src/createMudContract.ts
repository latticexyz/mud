import {
  Abi,
  Account,
  Address,
  Chain,
  GetContractParameters,
  GetContractReturnType,
  PublicClient,
  Transport,
  WalletClient,
  getContract,
} from "viem";
import pQueue from "p-queue";
import pRetry from "p-retry";
import { createNonceManager } from "./createNonceManager";

export function createMudContract<
  TTransport extends Transport,
  TAddress extends Address,
  TAbi extends Abi,
  TChain extends Chain,
  TAccount extends Account,
  TPublicClient extends PublicClient<TTransport, TChain>,
  TWalletClient extends WalletClient<TTransport, TChain, TAccount>
>({
  abi,
  address,
  publicClient,
  walletClient,
}: Required<
  GetContractParameters<TTransport, TChain, TAccount, TAbi, TPublicClient, TWalletClient, TAddress>
>): GetContractReturnType<TAbi, TPublicClient, TWalletClient, TAddress> {
  const contract = getContract<TTransport, TAddress, TAbi, TChain, TAccount, TPublicClient, TWalletClient>({
    abi,
    address,
    publicClient,
    walletClient,
  });

  // TODO: fix write types
  if (contract.write) {
    const nonceManager = createNonceManager({
      publicClient: publicClient as PublicClient,
      address: walletClient.account.address,
    });

    const queue = new pQueue({ concurrency: 1 });

    const write = contract.write;
    contract.write = new Proxy(
      {},
      {
        get(_, functionName: string) {
          return async (args: any[]) => {
            if (!nonceManager.hasNonce()) {
              await nonceManager.resetNonce();
            }

            return await queue.add(() =>
              pRetry(
                async () => {
                  const nonce = nonceManager.nextNonce();
                  console.log("nonce", nonce);
                  return await write[functionName]({ args, nonce });
                },
                {
                  retries: 5,
                  onFailedAttempt: async (error) => {
                    if (nonceManager.shouldResetNonce(error)) {
                      console.log("got nonce error, retrying", error);
                      // TODO: add a delay here?
                      await nonceManager.resetNonce();
                    }
                  },
                }
              )
            );
          };
        },
      }
    );
  }

  return contract;
}
