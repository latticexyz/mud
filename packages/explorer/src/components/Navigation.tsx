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
    <Link href={getLinkUrl(href)} className="group px-3 text-sm font-semibold uppercase">
      <span
        className={cn(
          "flex border-b-4 border-transparent pb-3 pt-4 transition group-hover:border-orange-500/30",
          pathname === getLinkUrl(href) ? "border-orange-500 group-hover:border-orange-400" : null,
        )}
      >
        {children}
      </span>
    </Link>
  );
}

export function Navigation() {
  const { data, isFetched } = useWorldAbiQuery();
  return (
    <div className="pb-4">
      <div className="flex items-center justify-between">
        <div className="-mx-3 flex">
          <NavigationLink href="explore">Explore</NavigationLink>
          <NavigationLink href="interact">Interact</NavigationLink>
          <NavigationLink href="observe">Observe</NavigationLink>
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
