"use client";

import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { Button } from "../../../../components/ui/Button";
import { useWorldUrl } from "../../../../hooks/useWorldUrl";

export default function NotFound() {
  const getUrl = useWorldUrl();
  return (
    <main className="px-6 py-24 text-center">
      <p className="text-3xl font-semibold text-orange-600">404</p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-5xl">Page not found</h1>
      <p className="mt-6 text-base leading-7 text-white/70">Sorry, we couldn’t find the page you’re looking for.</p>
      <div className="mt-10 flex items-center justify-center gap-x-6">
        <Button asChild>
          <Link href={getUrl("explore")}>Go back to explorer</Link>
        </Button>

        <Button variant="secondary" asChild>
          <a href="https://lattice.xyz/discord" target="_blank" rel="noopener noreferrer">
            Contact on Discord <ExternalLink className="-mt-0.5 ml-2 h-4 w-4" />
          </a>
        </Button>
      </div>
    </main>
  );
}
