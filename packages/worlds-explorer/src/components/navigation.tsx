"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navigation() {
  const pathname = usePathname();
  return (
    <div className="flex gap-x-4 py-4">
      <Link href="/" className={cn(pathname === "/" && "font-semibold underline")}>
        Home
      </Link>
      <Link href="/interact" className={cn(pathname === "/interact" && "font-semibold underline")}>
        Interact
      </Link>
    </div>
  );
}
