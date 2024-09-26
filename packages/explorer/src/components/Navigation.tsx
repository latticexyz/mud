"use client";

import { Loader } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWorldUrl } from "../app/(explorer)/hooks/useWorldUrl";
import { useWorldAbiQuery } from "../app/(explorer)/queries/useWorldAbiQuery";
import { LatestBlock } from "../components/LatestBlock";
import { Separator } from "../components/ui/Separator";
import { cn } from "../utils";
import { ConnectButton } from "./ConnectButton";

function NavigationLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const getLinkUrl = useWorldUrl();
  return (
    <Link
      href={getLinkUrl(href)}
      className={cn("text-sm uppercase underline-offset-[16px]", {
        "font-semibold underline decoration-orange-500 decoration-4": pathname === getLinkUrl(href),
      })}
    >
      {children}
    </Link>
  );
}

export function Navigation() {
  const { data, isFetched } = useWorldAbiQuery();
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div className="flex gap-x-6 py-4">
          <NavigationLink href="explore">Explore</NavigationLink>
          <NavigationLink href="interact">Interact</NavigationLink>
          <NavigationLink href="observe">Observe</NavigationLink>
          <NavigationLink href="transactions">Transactions</NavigationLink>
        </div>

        {isFetched && !data?.isWorldDeployed && (
          <h4 className="font-mono text-sm font-bold uppercase opacity-70">
            Waiting for world deploy <Loader className="inline-block h-4 w-4 animate-spin" />
          </h4>
        )}

        <div className="flex items-center gap-x-4">
          <LatestBlock />
          <ConnectButton />
        </div>
      </div>

      <Separator />
    </div>
  );
}
