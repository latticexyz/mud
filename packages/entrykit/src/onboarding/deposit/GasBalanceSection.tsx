import { twMerge } from "tailwind-merge";
import { AccountModalSection } from "../../AccountModalSection";
import { BoltIcon } from "../../icons/BoltIcon";
// import { useGasTankBalance } from "../../useGasTankBalance";
import { Balance } from "./Balance";
import { formatActions } from "./formatActions";
import { useFeePerAction } from "./useFeePerAction";

export function GasBalanceSection() {
  const { data: feePerAction } = useFeePerAction();
  // const { gasTankBalance: balance } = useGasTankBalance(); TODO: add this back
  const balance = 0n;

  // TODO: better pending state?
  if (balance == null) return;

  return (
    <AccountModalSection className="bg-neutral-200 dark:bg-neutral-700">
      <div className="group flex items-center gap-3 p-5">
        <BoltIcon className={twMerge("text-xl", balance === 0n ? "text-red-500" : undefined)} />
        <div className="flex-grow text-xl font-mono text-black dark:text-white">
          {feePerAction != null ? <>{formatActions(balance / feePerAction)} actions</> : null}
        </div>
        <div className="flex-shrink-0 grid">
          <div
            className={twMerge(
              "col-start-1 row-start-1 flex items-center justify-end",
              "text-sm text-neutral-500 dark:text-neutral-400",
              "transition opacity-100 group-hover:opacity-0 group-hover:pointer-events-none",
            )}
          >
            <Balance amount={balance} />
          </div>
        </div>
      </div>
    </AccountModalSection>
  );
}
