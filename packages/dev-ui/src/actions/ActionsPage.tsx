import { useStore } from "../useStore";
import { TransactionSummary } from "./TransactionSummary";

export function ActionsPage() {
  const transactions = useStore((state) => state.transactions);
  return (
    <div className="p-6 space-y-2">
      {transactions.map((tx) => (
        <TransactionSummary key={tx.hash} {...tx} />
      ))}
    </div>
  );
}
