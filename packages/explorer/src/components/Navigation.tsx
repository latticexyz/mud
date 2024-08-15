"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LatestBlock } from "../components/LatestBlock";
import { Separator } from "../components/ui/Separator";
import { useLinkUrl } from "../hooks/useLinkUrl";
import { cn } from "../lib/utils";
import { AccountSelect } from "./AccountSelect";

export function Navigation() {
  const pathname = usePathname();
  const getLinkUrl = useLinkUrl();

  return (
    <div className="mb-8 sticky top-0 bg-background z-10">
      <div className="flex justify-between items-center">
        <div className="flex gap-x-6 py-4">
          <Link
            href={getLinkUrl("explorer")}
            className={cn("underline-offset-[16px] text-sm uppercase", {
              "font-semibold underline decoration-orange-500 decoration-4": pathname === getLinkUrl("explorer"),
            })}
          >
            Data explorer
          </Link>

          <Link
            href={getLinkUrl("interact")}
            className={cn("underline-offset-[16px] text-sm uppercase", {
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
