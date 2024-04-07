import { Chain, PrivateKeyAccount, PublicClient, Transport } from "viem";
import { signerToSimpleSmartAccount } from "permissionless/accounts";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { AppAccount, entryPointAddress, smartAccountFactory } from "./common";

type GetAppAccountOptions = {
  publicClient: PublicClient<Transport, Chain>;
  appSignerAccount: PrivateKeyAccount;
};

async function getAppAccount({ publicClient, appSignerAccount }: GetAppAccountOptions): Promise<AppAccount> {
  return await signerToSimpleSmartAccount(publicClient, {
    entryPoint: entryPointAddress,
    factoryAddress: smartAccountFactory,
    signer: appSignerAccount,
  });
}

export function useAppAccount({
  publicClient,
  appSignerAccount,
}: Partial<GetAppAccountOptions>): UseQueryResult<AppAccount> {
  const queryKey = [
    "mud:appAccount",
    publicClient?.chain.id,
    entryPointAddress,
    smartAccountFactory,
    appSignerAccount?.address,
  ] as const;

  return useQuery(
    publicClient && appSignerAccount
      ? {
          queryKey,
          queryFn: () => getAppAccount({ publicClient, appSignerAccount }),
          staleTime: Infinity,
        }
      : {
          queryKey,
          enabled: false,
        },
  );
}
