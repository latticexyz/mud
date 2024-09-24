"use client";

import { ExternalLink, RefreshCwIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "../../components/ui/Button";
import { useWorldUrl } from "./hooks/useWorldUrl";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ reset, error }: Props) {
  const getUrl = useWorldUrl();
  return (
    <main className="px-6 py-24 text-center">
      <p className="text-3xl font-semibold text-orange-600">500</p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-5xl">Something went wrong :(</h1>

      {error.message && (
        <pre className="mt-8 inline-block w-[580px] whitespace-normal rounded-md border border-white/15 bg-secondary p-4 text-left font-mono text-sm leading-6 text-white">
          {error.message}
        </pre>
      )}

      <div className="mt-10 flex items-center justify-center gap-x-6">
        <Button asChild>
          <Link href={getUrl("explore")}>Go back to explorer</Link>
        </Button>

        <Button variant="secondary" onClick={reset}>
          Try again <RefreshCwIcon className="ml-2 h-4 w-4" />
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
