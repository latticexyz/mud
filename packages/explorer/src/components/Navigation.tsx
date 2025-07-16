"use client";

import { BadgeCheckIcon, LoaderIcon } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { Address } from "viem";
import { useChain } from "../app/(explorer)/hooks/useChain";
import { useReadOnly } from "../app/(explorer)/hooks/useReadOnly";
import { useWorldUrl } from "../app/(explorer)/hooks/useWorldUrl";
import { useWorldAbiQuery } from "../app/(explorer)/queries/useWorldAbiQuery";
import { useVerifiedWorldsQuery } from "../app/(explorer)/queries/useWorldsQuery";
import { LatestBlock } from "../components/LatestBlock";
import { Separator } from "../components/ui/Separator";
import { cn } from "../utils";
import { ChainSwitch } from "./ChainSwitch";
import { ConnectButton } from "./ConnectButton";
import { CopyButton } from "./CopyButton";
import { TruncatedHex } from "./ui/TruncatedHex";

function NavigationLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const getLinkUrl = useWorldUrl();
  const currentPath = pathname.split("?")[0];
  const targetPath = getLinkUrl(href).split("?")[0];

  return (
    <Link href={getLinkUrl(href)} className="group px-3 text-sm font-semibold uppercase">
      <span
        className={cn(
          "flex border-b-4 border-transparent pb-3 pt-4 transition group-hover:border-orange-500/30",
          currentPath === targetPath ? "border-orange-500 group-hover:border-orange-400" : null,
        )}
      >
        {children}
      </span>
    </Link>
  );
}

function WorldTitle() {
  const chain = useChain();
  const { worldAddress } = useParams<{ worldAddress: Address }>();
  const { data: verifiedWorlds } = useVerifiedWorldsQuery(chain);
  const verifiedWorld = verifiedWorlds?.get(worldAddress);

  return (
    <div className="flex items-center gap-x-2 text-sm">
      <span className="mx-2 opacity-30">|</span>
      {verifiedWorld && (
        <span className="flex items-center gap-x-2 text-sm font-semibold">
          {verifiedWorld} <BadgeCheckIcon className="h-4 w-4 text-green-500" />
        </span>
      )}
      <span className="text-white/70">
        <TruncatedHex hex={worldAddress} />
      </span>
      <CopyButton value={worldAddress} />
    </div>
  );
}

export function Navigation() {
  const isReadOnly = useReadOnly();
  const { data, isFetched } = useWorldAbiQuery();

  return (
    <div className="pb-4">
      <div className="flex items-center justify-between">
        <div className="-mx-3 flex">
          <NavigationLink href="explore">Explore</NavigationLink>
          {!isReadOnly && <NavigationLink href="interact">Interact</NavigationLink>}
          <NavigationLink href="observe">Observe</NavigationLink>
          <NavigationLink href="decode">Decode</NavigationLink>
          <WorldTitle />
        </div>

        {isFetched && !data?.isWorldDeployed && (
          <h4 className="font-mono text-sm font-bold uppercase opacity-70">
            Waiting for world deploy <LoaderIcon className="inline-block h-4 w-4 animate-spin" />
          </h4>
        )}

        <div className="flex items-center gap-x-4">
          <LatestBlock />
          <ChainSwitch size="sm" />
          {!isReadOnly ? <ConnectButton /> : null}
        </div>
      </div>

      <Separator />
    </div>
  );
}
