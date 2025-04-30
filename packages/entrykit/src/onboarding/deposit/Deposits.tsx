import { useQuery } from "@tanstack/react-query";
import { NativeDepositStatus } from "./NativeDepositStatus";
import { RelayDepositStatus } from "./RelayDepositStatus";
import { useDeposits } from "./useDeposits";
// import { useOnboardingSteps } from "../../useOnboardingSteps"; // TODO: bring back
import { useEffect } from "react";
import { useInvalidateBalance } from "./useInvalidateBalance";

export function Deposits() {
  const invalidateBalance = useInvalidateBalance();
  const { deposits, removeDeposit } = useDeposits();
  // const { resetStep } = useOnboardingSteps();

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
      // TODO: reset step only when balance was previously empty
      // invalidateBalance().then(resetStep);
    }
  }, [invalidateBalance, isComplete]);

  if (!deposits.length) return null;

  return (
    <div className="flex flex-col gap-1 mt-4">
      {deposits.map((deposit) => {
        if (deposit.type === "transfer") {
          return <NativeDepositStatus key={deposit.uid} {...deposit} onDismiss={() => removeDeposit(deposit.uid)} />;
        } else if (deposit.type === "relay") {
          return <RelayDepositStatus key={deposit.uid} {...deposit} onDismiss={() => removeDeposit(deposit.uid)} />;
        }
      })}
    </div>
  );
}
