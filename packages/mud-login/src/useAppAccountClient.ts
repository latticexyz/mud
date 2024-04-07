import { useMemo } from "react";
import { useAccount, usePublicClient } from "wagmi";
import { http, maxUint256, toHex } from "viem";
import { callFrom } from "@latticexyz/world/internal";
import { createSmartAccountClient } from "permissionless";
import { createPimlicoBundlerClient } from "permissionless/clients/pimlico";
import { call, getTransactionCount } from "viem/actions";
import { useLoginConfig } from "./Context";
import { useAppSigner } from "./useAppSigner";
import { useAppAccount } from "./useAppAccount";
import { AppAccountClient, entryPointAddress } from "./common";
import { getUserBalanceSlot } from "./getUserBalanceSlot";
import { getEntryPointDepositSlot } from "./getEntryPointDepositSlot";

export function useAppAccountClient(): AppAccountClient | undefined {
  const [appSignerAccount] = useAppSigner();
  const { chainId, worldAddress, gasTankAddress } = useLoginConfig();
  const { address: userAddress } = useAccount();
  const publicClient = usePublicClient({ chainId });
  const { data: appAccount } = useAppAccount({ publicClient, appSignerAccount });

  return useMemo(() => {
    if (!appSignerAccount) return;
    if (!userAddress) return;
    if (!publicClient) return;
    if (!appAccount) return;

    const pimlicoBundlerClient = createPimlicoBundlerClient({
      chain: publicClient.chain,
      transport: http("http://127.0.0.1:4337"),
      entryPoint: entryPointAddress,
    });

    const appAccountClient = createSmartAccountClient({
      chain: publicClient.chain,
      account: appAccount,
      bundlerTransport: http("http://127.0.0.1:4337"),
      middleware: {
        sponsorUserOperation: async ({ userOperation }) => {
          const gasEstimates = await pimlicoBundlerClient.estimateUserOperationGas(
            {
              userOperation: {
                ...userOperation,
                paymaster: gasTankAddress,
                paymasterData: "0x",
              },
            },
            {
              // Pimlico's gas estimation runs with high gas limits, which can make the estimation fail if
              // the cost would exceed the user's balance.
              // We override the user's balance in the paymaster contract and the deposit balance of the
              // paymaster in the entry point contract to make the gas estimation succeed.
              [gasTankAddress]: {
                stateDiff: {
                  [getUserBalanceSlot(userAddress)]: toHex(maxUint256),
                },
              },
              [entryPointAddress]: {
                stateDiff: {
                  [getEntryPointDepositSlot(gasTankAddress)]: toHex(maxUint256),
                },
              },
            },
          );

          return {
            paymasterData: "0x",
            paymaster: gasTankAddress,
            ...gasEstimates,
          };
        },
        gasPrice: async () => (await pimlicoBundlerClient.getUserOperationGasPrice()).fast, // use pimlico bundler to get gas prices
      },
    })
      // TODO: can we replace the below with all publicActions?
      // .extend(publicActions(publicClient))
      .extend(() => ({
        getTransactionCount: (args) => {
          console.log("getTransactionCount, ", args);
          return getTransactionCount(publicClient, args);
        },
        call: (args) => call(publicClient, args),
      }))
      // .extend(transactionQueue(publicClient))
      // .extend(writeObserver({ onWrite: (write) => write$.next(write) }))
      .extend(
        callFrom({
          worldAddress,
          delegatorAddress: userAddress,
          publicClient,
        }),
      );

    return appAccountClient;
  }, [appSignerAccount, userAddress, publicClient, appAccount, worldAddress, gasTankAddress]);
}
