"use client";

import { notFound } from "next/navigation";
import { Address } from "viem";
import { isValidChainName } from "../../../../../common";
import { Navigation } from "../../../../../components/Navigation";
import { Providers } from "./Providers";
import { TransactionsWatcher } from "./observe/TransactionsWatcher";

type Props = {
  params: {
    chainName: string;
    worldAddress: Address;
  };
  children: React.ReactNode;
};

export default function WorldLayout({ params: { chainName }, children }: Props) {
  if (!isValidChainName(chainName)) {
    return notFound();
  }

  return (
    <Providers>
      <div className="flex h-screen flex-col">
        <Navigation />
        {children}
      </div>
      <TransactionsWatcher />
    </Providers>
  );
}
