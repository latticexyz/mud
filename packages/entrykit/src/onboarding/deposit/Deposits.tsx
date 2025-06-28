import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { TransferDepositStatus } from "./TransferDepositStatus";
import { RelayDepositStatus } from "./RelayDepositStatus";
import { useDeposits } from "./useDeposits";
import { useAccount, useClient } from "wagmi";
import { useEntryKitConfig } from "../../EntryKitConfigProvider";

export function Deposits() {
  const queryClient = useQueryClient();
  const { chainId } = useEntryKitConfig();
  const client = useClient({ chainId });
  const { address: userAddress } = useAccount();
  const { deposits, removeDeposit } = useDeposits();
  const { data: isComplete } = useQuery({
    queryKey: ["depositsComplete", deposits.map((deposit) => deposit.uid)],
    queryFn: async () => {
      if (!deposits.length) return false;
      await Promise.all(deposits.map((deposit) => deposit.isComplete));
      return true;
    },
  });

  useEffect(() => {
    if (isComplete) {
      queryClient.invalidateQueries({ queryKey: ["balance"] });
      queryClient.invalidateQueries({ queryKey: ["getBalance", client?.uid, userAddress] });
    }
  }, [client?.uid, isComplete, queryClient, userAddress]);

  if (!deposits.length) return null;

  return (
    <div className="flex flex-col gap-1 mt-4">
      {deposits.map((deposit) => {
        if (deposit.type === "transfer") {
          return <TransferDepositStatus key={deposit.uid} {...deposit} onDismiss={() => removeDeposit(deposit.uid)} />;
        } else if (deposit.type === "relay") {
          return <RelayDepositStatus key={deposit.uid} {...deposit} onDismiss={() => removeDeposit(deposit.uid)} />;
        }
      })}
    </div>
  );
}
