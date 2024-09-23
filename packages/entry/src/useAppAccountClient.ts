import { http, useAccount, usePublicClient } from "wagmi";
import { maxUint256, toHex, publicActions, createClient, Chain, walletActions } from "viem";
import { callFrom } from "@latticexyz/world/internal";
import { SmartAccountClientConfig, smartAccountActions } from "permissionless";
import { createPimlicoBundlerClient } from "permissionless/clients/pimlico";
import { useConfig } from "./EntryConfigProvider";
import { useAppSigner } from "./useAppSigner";
import { AppAccountClient, defaultPollingInterval, entryPointAddress, smartAccountFactory } from "./common";
import { getUserBalanceSlot } from "./utils/getUserBalanceSlot";
import { getEntryPointDepositSlot } from "./utils/getEntryPointDepositSlot";
import { transportObserver } from "./transportObserver";
import { ENTRYPOINT_ADDRESS_V07_TYPE } from "permissionless/types";
import { useErc4337Config } from "./useErc4337Config";
import { usePaymaster } from "./usePaymaster";
import { SendTransactionWithPaymasterParameters, sendTransaction } from "./actions/sendTransaction";
import { SmartAccount, signerToSimpleSmartAccount } from "permissionless/accounts";
import { UseQueryOptions, UseQueryResult, useQuery } from "@tanstack/react-query";
import { useAppChain } from "./useAppChain";
import { debug } from "./debug";
import { transactionQueue } from "@latticexyz/common/actions";

type Middleware = SmartAccountClientConfig<ENTRYPOINT_ADDRESS_V07_TYPE>["middleware"];

export function useAppAccountClient(): UseQueryResult<AppAccountClient> {
  const [appSignerAccount] = useAppSigner();
  const { worldAddress } = useConfig();
  const chain = useAppChain();
  const erc4337Config = useErc4337Config();
  const gasTank = usePaymaster("gasTank");
  const { address: userAddress } = useAccount();
  const publicClient = usePublicClient({ chainId: chain.id });

  const queryKey = [
    "mud:appAccountClient",
    chain.id,
    worldAddress,
    appSignerAccount?.address,
    userAddress,
    // this currently assumes a statically defined ERC-4337 config
    // TODO: add a `key` config option or similar to allow for dynamic usages?
    !!erc4337Config,
    gasTank?.address,
  ];

  return useQuery(
    appSignerAccount && userAddress && publicClient
      ? ({
          queryKey,
          staleTime: Infinity,
          queryFn: async () => {
            if (!erc4337Config) {
              debug("no ERC-4337 config, using app signer as app account");

              // We create our own client here so we can provide a custom client `type` that we'll use
              // later in the app to determine how deposits should work.
              const appAccountClient = createClient({
                type: "appSignerClient",
                // TODO: figure out what effect `key` has and how to use this option properly
                key: "appSignerClient",
                // TODO: figure out what effect `name` has and how to use this option properly
                name: "App Signer Client",
                chain,
                account: appSignerAccount,
                pollingInterval: defaultPollingInterval,
                // TODO: add websocket + fallback?
                // TODO: provide way to override this transport?
                transport: transportObserver("app signer account client", http()),
              })
                .extend(publicActions)
                .extend(walletActions)
                .extend(transactionQueue())
                .extend(
                  callFrom({
                    worldAddress,
                    delegatorAddress: userAddress,
                  }),
                );
              return appAccountClient;
            }

            // TODO: nicer error if this fails (e.g. bundler is unreachable)
            const appAccount = await signerToSimpleSmartAccount(publicClient, {
              entryPoint: entryPointAddress,
              factoryAddress: smartAccountFactory,
              signer: appSignerAccount,
            });

            const pimlicoBundlerClient = createPimlicoBundlerClient({
              chain: publicClient.chain,
              transport: transportObserver("pimlico bundler client", erc4337Config.transport),
              entryPoint: entryPointAddress,
              pollingInterval: defaultPollingInterval,
            }).extend(() => publicActions(publicClient));

            const gasEstimationStateOverrides = gasTank
              ? {
                  // Pimlico's gas estimation runs with high gas limits, which can make the estimation fail if
                  // the cost would exceed the user's balance.
                  // We override the user's balance in the paymaster contract and the deposit balance of the
                  // paymaster in the entry point contract to make the gas estimation succeed.
                  [gasTank.address]: {
                    stateDiff: {
                      [getUserBalanceSlot(userAddress)]: toHex(maxUint256),
                    },
                  },
                  [entryPointAddress]: {
                    stateDiff: {
                      [getEntryPointDepositSlot(gasTank.address)]: toHex(maxUint256),
                    },
                  },
                }
              : undefined;

            const gasTankMiddleware = gasTank
              ? ({
                  sponsorUserOperation: async ({ userOperation }) => {
                    const gasEstimates = await pimlicoBundlerClient.estimateUserOperationGas(
                      {
                        userOperation: {
                          ...userOperation,
                          paymaster: gasTank.address,
                          paymasterData: "0x",
                        },
                      },
                      gasEstimationStateOverrides,
                    );

                    return {
                      paymasterData: "0x",
                      paymaster: gasTank.address,
                      ...gasEstimates,
                    };
                  },
                } satisfies Middleware)
              : null;

            const middleware = { ...gasTankMiddleware };

            const appAccountClient = createClient({
              key: "Account",
              name: "Smart Account Client",
              type: "smartAccountClient",
              chain: publicClient.chain,
              account: appAccount,
              pollingInterval: defaultPollingInterval,
              transport: transportObserver("app smart account client", erc4337Config.transport),
            })
              .extend(() => publicActions(publicClient))
              .extend((client) => ({
                sendTransaction: (args) => {
                  return sendTransaction<Chain, SmartAccount<ENTRYPOINT_ADDRESS_V07_TYPE>, ENTRYPOINT_ADDRESS_V07_TYPE>(
                    client,
                    {
                      ...args,
                      middleware,
                    } as SendTransactionWithPaymasterParameters<
                      ENTRYPOINT_ADDRESS_V07_TYPE,
                      Chain,
                      SmartAccount<ENTRYPOINT_ADDRESS_V07_TYPE>
                    >,
                    {
                      estimateFeesPerGas: async () => (await pimlicoBundlerClient.getUserOperationGasPrice()).fast,
                    },
                  );
                },
              }))
              .extend(smartAccountActions({ middleware }))
              .extend(
                callFrom({
                  worldAddress,
                  delegatorAddress: userAddress,
                  publicClient,
                }),
              );
            // .extend(writeObserver({ onWrite: (write) => write$.next(write) }))

            return appAccountClient;
          },
        } satisfies UseQueryOptions)
      : {
          queryKey,
          enabled: false,
        },
  );
}
