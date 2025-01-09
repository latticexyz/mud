"use client";

import { notFound } from "next/navigation";
import { isValidChainName } from "../../../common";

type Props = {
  params: {
    chainName: string;
  };
  children: React.ReactNode;
};

export default function ChainLayout({ params: { chainName }, children }: Props) {
  if (!isValidChainName(chainName)) {
    return notFound();
  }

  return children;
}
