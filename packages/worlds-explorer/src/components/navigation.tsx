"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useBlockNumber } from "wagmi";

export function Navigation() {
  const pathname = usePathname();
  const { data: block } = useBlockNumber();

  console.log(block);

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
        {block != null && block > BigInt(0) && (
          <div className="inline-block mr-4">
            <div className="flex items-center justify-between text-xs font-extrabold text-green-600">
              <span
                className="mr-2 inline-block h-[8px] w-[8px] rounded-full animate-pulse"
                style={{
                  background: "rgb(64, 182, 107)",
                }}
              ></span>
              <span className="opacity-70">{block.toString()}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
