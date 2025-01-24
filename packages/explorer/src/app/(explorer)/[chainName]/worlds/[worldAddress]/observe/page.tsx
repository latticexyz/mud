import type { Metadata } from "next";
import { TransactionsTable } from "./TransactionsTable";

export const metadata: Metadata = {
  title: "Observe",
};

export default function ObservePage() {
  return <TransactionsTable />;
}
