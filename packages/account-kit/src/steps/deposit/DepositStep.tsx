import { parseEther } from "viem";
import { useGasTankBalance } from "../../useGasTankBalance";
import { PendingIcon } from "../../icons/PendingIcon";
import { useIsGasSpender } from "../../useIsGasSpender";
import { DepositContent } from "./DepositContent";
import { GasSpenderContent } from "./GasSpenderContent";

export function DepositStep() {
  const { gasTankBalance } = useGasTankBalance();
  const { isGasSpender } = useIsGasSpender();
  console.log({ gasTankBalance, isGasSpender });

  if (gasTankBalance == null || isGasSpender == null) {
    // TODO: better load state
    return <PendingIcon />;
  }

  // TODO: make min balance configurable
  // TODO: allow passing in gas per action, min actions
  if (gasTankBalance < parseEther("0.00001")) {
    return <DepositContent />;
  }

  if (!isGasSpender) {
    return <GasSpenderContent />;
  }

  return <>TODO: show completed state</>;
}
