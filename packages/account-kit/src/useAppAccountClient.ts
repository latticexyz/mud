import { useEffect, useMemo } from "react";
import { useAccount, usePublicClient } from "wagmi";
import { maxUint256, toHex, publicActions, createClient } from "viem";
import { callFrom } from "@latticexyz/world/internal";
import { SmartAccountClientConfig, smartAccountActions } from "permissionless";
import { createPimlicoBundlerClient } from "permissionless/clients/pimlico";
import { useConfig } from "./AccountKitProvider";
import { useAppSigner } from "./useAppSigner";
import { useAppAccount } from "./useAppAccount";
import { AppAccountClient, defaultPollingInterval, entryPointAddress } from "./common";
import { getUserBalanceSlot } from "./utils/getUserBalanceSlot";
import { getEntryPointDepositSlot } from "./utils/getEntryPointDepositSlot";
import { transportObserver } from "./transportObserver";
import { ENTRYPOINT_ADDRESS_V07_TYPE } from "permissionless/types/entrypoint";
import { useErc4337Config } from "./useErc4337Config";
import { usePaymaster } from "./usePaymaster";

type Middleware = SmartAccountClientConfig<ENTRYPOINT_ADDRESS_V07_TYPE>["middleware"];

export function useAppAccountClient(): AppAccountClient | undefined {
  const [appSignerAccount] = useAppSigner();
  const { chain, worldAddress } = useConfig();
  const erc4337Config = useErc4337Config();
  const gasTank = usePaymaster("gasTank");
  const { address: userAddress } = useAccount();
  const publicClient = usePublicClient({ chainId: chain.id });
  const { data: appAccount, error: appAccountError } = useAppAccount({ publicClient, appSignerAccount });

  useEffect(() => {
    if (appAccountError?.message) {
      console.error(
        "Error getting app account. Is the bundler fully deployed and running? If not, you may need to run `pnpm local-bundler`.",
        appAccountError.message,
      );
    }
  }, [appAccountError?.message]);

  // TODO: move this to a query so we can surface app account errors
  return useMemo(() => {
    if (!appSignerAccount) return;
    if (!userAddress) return;
    if (!publicClient) return;
    if (!appAccount) return;

    // TODO: return a different client if we're not using ERC-4337
    if (!erc4337Config) {
      throw new Error("No ERC-4337 config was found.");
    }

    const pimlicoBundlerClient = createPimlicoBundlerClient({
      chain: publicClient.chain,
      transport: transportObserver("pimlico bundler client", erc4337Config.transport),
      entryPoint: entryPointAddress,
      pollingInterval: defaultPollingInterval,
    }).extend(() => publicActions(publicClient));

    const baseMiddleware = {
      gasPrice: async () => (await pimlicoBundlerClient.getUserOperationGasPrice()).fast, // use pimlico bundler to get gas prices
    } satisfies Middleware;

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
              {
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
              },
            );

            return {
              paymasterData: "0x",
              paymaster: gasTank.address,
              ...gasEstimates,
            };
          },
        } satisfies Middleware)
      : null;

    const appAccountClient = createClient({
      key: "Account",
      name: "Smart Account Client",
      type: "smartAccountClient",
      chain: publicClient.chain,
      account: appAccount,
      pollingInterval: defaultPollingInterval,
      transport: transportObserver("bundler transport", erc4337Config.transport),
    })
      .extend(
        callFrom({
          worldAddress,
          delegatorAddress: userAddress,
          publicClient,
        }),
      )
      .extend(
        smartAccountActions({
          middleware: {
            ...baseMiddleware,
            ...gasTankMiddleware,
          },
        }),
      )
      // .extend(transactionQueue({ publicClient }))
      // .extend(writeObserver({ onWrite: (write) => write$.next(write) }))
      .extend(() => publicActions(publicClient));

    return appAccountClient;
  }, [appSignerAccount, userAddress, publicClient, appAccount, erc4337Config, gasTank, worldAddress]);
}
