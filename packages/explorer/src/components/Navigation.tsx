"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LatestBlock } from "../components/LatestBlock";
import { Separator } from "../components/ui/Separator";
import { useWorldUrl } from "../hooks/useWorldUrl";
import { cn } from "../lib/utils";
import { AccountSelect } from "./AccountSelect";

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
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div className="flex gap-x-6 py-4">
          <NavigationLink href="/explorer">Data Explorer</NavigationLink>
          <NavigationLink href="/interact">Interact</NavigationLink>
          <NavigationLink href="/transactions">Transactions</NavigationLink>
        </div>

        <div className="flex items-center gap-x-4">
          <LatestBlock />
          <AccountSelect />
        </div>
      </div>

      <Separator />
    </div>
  );
}
