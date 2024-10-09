import { useQuery } from "@tanstack/react-query";
import { Account } from "viem";

export function useIsDeployed(account: Account | undefined) {
  const queryKey = ["isDeployed", account?.type, account?.address];
  return useQuery(
    account
      ? {
          queryKey,
          queryFn: async () => {
            if (account.type !== "smart") throw new Error("Not a smart account.");
            return await account.isDeployed();
          },
        }
      : { queryKey, enabled: false },
  );
}
