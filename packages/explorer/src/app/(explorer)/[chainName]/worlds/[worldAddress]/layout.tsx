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
      <Navigation />
      {children}
      <TransactionsWatcher />
    </Providers>
  );
}
