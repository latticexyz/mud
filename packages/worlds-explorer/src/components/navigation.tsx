"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LatestBlock } from "@/components/latest-block";
import { AccountSelect } from "./account-select";
import { Separator } from "./ui/separator";

export function Navigation() {
  const pathname = usePathname();

  return (
    <div className="mb-8 sticky top-0 bg-background z-10">
      <div className="flex justify-between items-center">
        <div className="flex gap-x-6 py-4">
          <Link
            href="/"
            className={cn("underline-offset-[16px] uppercase", {
              "font-semibold underline decoration-orange-500 decoration-4": pathname === "/",
            })}
          >
            Data explorer
          </Link>

          <Link
            href="/interact"
            className={cn("underline-offset-[16px] uppercase", {
              "font-semibold underline decoration-orange-500 decoration-4": pathname === "/interact",
            })}
          >
            Interact
          </Link>
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