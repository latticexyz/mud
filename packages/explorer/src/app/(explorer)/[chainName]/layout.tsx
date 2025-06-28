"use client";

import { notFound, redirect, usePathname, useSearchParams } from "next/navigation";
import { chainIdToName, isValidChainId, isValidChainName } from "../../../common";
import { Providers } from "./Providers";

type Props = {
  params: {
    chainName: string;
  };
  children: React.ReactNode;
};

export default function ChainLayout({ params: { chainName: chainIdOrName }, children }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (!isValidChainName(chainIdOrName)) {
    const chainId = Number(chainIdOrName);
    if (isValidChainId(chainId)) {
      const chainName = chainIdToName[chainId];
      const newPathname = pathname.replace(chainIdOrName, chainName);

      if (pathname !== newPathname) {
        const search = searchParams.toString();
        const redirectUrl = search ? `${newPathname}?${search}` : `${newPathname}`;
        return redirect(redirectUrl);
      }
    }
    return notFound();
  }

  return <Providers>{children}</Providers>;
}
