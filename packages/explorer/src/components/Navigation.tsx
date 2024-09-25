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

export function Navigation() {
  const pathname = usePathname();
  const getLinkUrl = useWorldUrl();
  const { data, isFetched } = useWorldAbiQuery();

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div className="flex gap-x-6 py-4">
          <Link
            href={getLinkUrl("explore")}
            className={cn("text-sm uppercase underline-offset-[16px]", {
              "font-semibold underline decoration-orange-500 decoration-4": pathname === getLinkUrl("explore"),
            })}
          >
            Explore
          </Link>

          <Link
            href={getLinkUrl("interact")}
            className={cn("text-sm uppercase underline-offset-[16px]", {
              "font-semibold underline decoration-orange-500 decoration-4": pathname === getLinkUrl("interact"),
            })}
          >
            Interact
          </Link>

          <Link
            href={getLinkUrl("observe")}
            className={cn("text-sm uppercase underline-offset-[16px]", {
              "font-semibold underline decoration-orange-500 decoration-4": pathname === getLinkUrl("observe"),
            })}
          >
            Observe
          </Link>
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
