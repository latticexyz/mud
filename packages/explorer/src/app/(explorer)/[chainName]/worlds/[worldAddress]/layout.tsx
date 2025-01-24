"use client";

import { notFound } from "next/navigation";
import { Address } from "viem";
import { use } from "react";
import { isValidChainName } from "../../../../../common";
import { Navigation } from "../../../../../components/Navigation";
import { Providers } from "./Providers";
import { TransactionsWatcher } from "./observe/TransactionsWatcher";

type Props = {
  params: Promise<{
    chainName: string;
    worldAddress: Address;
  }>;
  children: React.ReactNode;
};

export default function WorldLayout(props: Props) {
  const params = use(props.params);
  const { chainName } = params;
  const { children } = props;

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
