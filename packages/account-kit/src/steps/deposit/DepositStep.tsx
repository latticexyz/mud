import { useGasTankBalance } from "../../useGasTankBalance";
import { PendingIcon } from "../../icons/PendingIcon";
import { useIsGasSpender } from "../../useIsGasSpender";
import { DepositContent } from "./DepositContent";
// import { DepositManualContent } from "./DepositManualContent";

export function DepositStep() {
  const { gasTankBalance } = useGasTankBalance();
  const { isGasSpender } = useIsGasSpender();

  if (gasTankBalance == null || isGasSpender == null) {
    // TODO: better load state
    return <PendingIcon />;
  }

  // return <DepositManualContent />;
  return <DepositContent />;
}
