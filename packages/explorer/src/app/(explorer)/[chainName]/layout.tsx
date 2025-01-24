"use client";

import { notFound } from "next/navigation";
import { use } from "react";
import { isValidChainName } from "../../../common";

export default function ChainLayout({
  params,
  children,
}: {
  params: Promise<{ chainName: string }>;
  children: React.ReactNode;
}): React.ReactNode {
  const resolvedParams = use(params);
  const { chainName } = resolvedParams;

  if (!isValidChainName(chainName)) {
    return notFound();
  }

  return children;
}
