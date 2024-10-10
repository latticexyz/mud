import { useQuery } from "@tanstack/react-query";
import { TransferDepositStatus } from "./TransferDepositStatus";
import { assertExhaustive } from "@latticexyz/common/utils";
import { BridgeDepositStatus } from "./BridgeDepositStatus";
import { RelayDepositStatus } from "./RelayDepositStatus";
import { useDeposits } from "./useDeposits";
import { useOnboardingSteps } from "../../useOnboardingSteps";
import { useEffect } from "react";
import { useInvalidateBalance } from "./useInvalidateBalance";

export function Deposits() {
  const invalidateBalance = useInvalidateBalance();
  const { deposits, removeDeposit } = useDeposits();
  const { resetStep } = useOnboardingSteps();

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
      invalidateBalance().then(resetStep);
    }
  }, [invalidateBalance, isComplete, resetStep]);

  if (!deposits.length) return null;

  return (
    <div className="flex flex-col gap-1 px-5">
      {deposits.map((deposit) => {
        switch (deposit.type) {
          case "transfer":
            return (
              <TransferDepositStatus key={deposit.uid} {...deposit} onDismiss={() => removeDeposit(deposit.uid)} />
            );
          case "bridge":
            return <BridgeDepositStatus key={deposit.uid} {...deposit} onDismiss={() => removeDeposit(deposit.uid)} />;
          case "relay":
            return <RelayDepositStatus key={deposit.uid} {...deposit} onDismiss={() => removeDeposit(deposit.uid)} />;
          default:
            // TODO: wtf TS y u no narrow
            assertExhaustive(deposit.type);
        }
      })}
    </div>
  );
}
