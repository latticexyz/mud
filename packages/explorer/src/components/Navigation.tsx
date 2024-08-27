"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LatestBlock } from "../components/LatestBlock";
import { Separator } from "../components/ui/Separator";
import { useWorldUrl } from "../hooks/useWorldUrl";
import { cn } from "../lib/utils";
import { AccountSelect } from "./AccountSelect";

export function Navigation() {
  const pathname = usePathname();
  const getLinkUrl = useWorldUrl();

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div className="flex gap-x-6 py-4">
          <Link
            href={getLinkUrl("explorer")}
            className={cn("text-sm uppercase underline-offset-[16px]", {
              "font-semibold underline decoration-orange-500 decoration-4": pathname === getLinkUrl("explorer"),
            })}
          >
            Data explorer
          </Link>

          <Link
            href={getLinkUrl("interact")}
            className={cn("text-sm uppercase underline-offset-[16px]", {
              "font-semibold underline decoration-orange-500 decoration-4": pathname === getLinkUrl("interact"),
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
