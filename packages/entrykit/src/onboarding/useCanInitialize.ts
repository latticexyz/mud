import { useQuery } from "@tanstack/react-query";
import { Account } from "viem";
import { isCoinbaseSmartAccount } from "../smart-account/isCoinbaseSmartAccount";

export function useCanInitialize(account: Account | undefined) {
  const queryKey = ["canInitialize", account?.type, account?.address];
  return useQuery(
    account
      ? {
          queryKey,
          queryFn: async () => {
            if (!isCoinbaseSmartAccount(account)) return false;
            if (!account.initializer) return false;
            if (!(await account.isDeployed())) return true;
            return await account.isOwner(account.initializer);
          },
        }
      : { queryKey, enabled: false },
  );
}
