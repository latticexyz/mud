import { ReactNode } from "react";
import { IndexerProvider } from "./IndexerProvider";

type ServerIndexerProviderProps = {
  children: ReactNode;
};

export function ServerIndexerProvider({ children }: ServerIndexerProviderProps) {
  // This runs on the server, so we can access process.env directly
  const indexerPort = process.env.INDEXER_PORT || process.env.NEXT_PUBLIC_INDEXER_PORT || "7777";

  return <IndexerProvider serverIndexerPort={indexerPort}>{children}</IndexerProvider>;
}
