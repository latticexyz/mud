"use client";

import { ExternalLink, RefreshCwIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "../components/ui/Button";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: Props) {
  return (
    <main className="py-24 px-6 text-center">
      <p className="text-3xl font-semibold text-orange-600">400</p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-5xl">Something went wrong :(</h1>

      <pre className="mt-10 max-w-full text-md text-left rounded border border-orange-900 bg-orange-50 text-orange-900 p-4 text-sm inline-block whitespace-pre-wrap">
        {error.message}
      </pre>

      <div className="mt-10 flex items-center justify-center gap-x-6">
        <Button asChild>
          <Link href="/">Go back to explorer</Link>
        </Button>

        <Button variant="secondary" onClick={reset}>
          Try again <RefreshCwIcon className="h-4 w-4 ml-2" />
        </Button>

        <Button variant="secondary" asChild>
          <a href="https://lattice.xyz/discord" target="_blank" rel="noopener noreferrer">
            Contact on Discord <ExternalLink className="h-4 w-4 ml-2 -mt-0.5" />
          </a>
        </Button>
      </div>
    </main>
  );
}
