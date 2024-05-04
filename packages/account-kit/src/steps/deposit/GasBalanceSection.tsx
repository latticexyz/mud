import { twMerge } from "tailwind-merge";
import { AccountModalSection } from "../../AccountModalSection";
import { BoltIcon } from "../../icons/BoltIcon";
import { useGasTankBalance } from "../../useGasTankBalance";
import { Balance } from "./Balance";
import { formatActions } from "./formatActions";
import { useGasPerAction } from "./useGasPerAction";
import { WithdrawButton } from "./WithdrawButton";

export function GasBalanceSection() {
  const gasPerAction = useGasPerAction();
  const { gasTankBalance: balance } = useGasTankBalance();

  // TODO: better pending state?
  if (balance == null) return;

  // TODO: factor in gas price (L1+L2)
  const actions = balance / gasPerAction;

  return (
    <AccountModalSection className="bg-neutral-200 dark:bg-neutral-700">
      <div className="group flex items-center gap-3 p-5">
        <BoltIcon className={twMerge("text-xl", balance === 0n ? "text-red-500" : undefined)} />
        <div className="flex-grow text-xl font-mono text-black dark:text-white">{formatActions(actions)} actions</div>
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
          <div
            className={twMerge(
              "col-start-1 row-start-1 flex items-center justify-end",
              "transition opacity-0 translate-x-1 group-hover:translate-x-0 group-hover:opacity-100",
            )}
          >
            <WithdrawButton />
          </div>
        </div>
      </div>
    </AccountModalSection>
  );
}
