import { formatEther } from "viem";
import { AccountModalSection } from "../../AccountModalSection";
import { CashIcon } from "../../icons/CashIcon";
import { useGasTankBalance } from "../../useGasTankBalance";

export function GasBalanceSection() {
  const { gasTankBalance: balance } = useGasTankBalance();
  // TODO: better pending state?
  if (balance == null) return;

  return (
    <AccountModalSection className="bg-neutral-200 dark:bg-neutral-700">
      <div className="flex items-center gap-4 p-5 text-xl font-mono">
        <CashIcon className={balance === 0n ? "text-red-500" : undefined} />
        <span className="text-black dark:text-white">{formatEther(balance)} Ξ</span>
      </div>
    </AccountModalSection>
  );
}
