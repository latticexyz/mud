"use client";

import { Navigation } from "../../../../../components/Navigation";
import { Providers } from "./Providers";
import { TransactionsWatcher } from "./observe/TransactionsWatcher";

export default function WorldLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <Navigation />
      <TransactionsWatcher />
      {children}
    </Providers>
  );
}
