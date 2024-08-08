"use client";

import { useAccount } from "wagmi";
import { Account } from "@/components/account";
import { WalletOptions } from "@/components/wallet-options";

export function ConnectWallet() {
  const { isConnected } = useAccount();
  if (isConnected) return <Account />;
  return <WalletOptions />;
}
