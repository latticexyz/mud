"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LatestBlock } from "@/components/latest-block";

export function Navigation() {
  const pathname = usePathname();

  return (
    <div className="flex justify-between items-center">
      <div className="flex gap-x-4 py-4">
        <Link href="/" className={cn(pathname === "/" && "font-semibold underline")}>
          Home
        </Link>
        <Link href="/interact" className={cn(pathname === "/interact" && "font-semibold underline")}>
          Interact
        </Link>
      </div>

      <div>
        <LatestBlock />
      </div>
    </div>
  );
}
