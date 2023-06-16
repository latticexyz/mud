import { useStore } from "../useStore";
import { NavButton } from "../NavButton";
import { TransactionSummary } from "../actions/TransactionSummary";

export function ActionsSummary() {
  const transactions = useStore((state) => state.transactions.slice(-3));

  return (
    <>
      {transactions.length ? (
        <>
          <div className="space-y-1">
            {transactions.map((hash) => (
              <TransactionSummary key={hash} hash={hash} />
            ))}
          </div>
          <NavButton to="/actions" className="block w-full bg-white/5 hover:bg-blue-700 hover:text-white">
            See more
          </NavButton>
        </>
      ) : (
        <div>Waiting for transactions…</div>
      )}
    </>
  );
}
