"use client";

import { env } from "next-runtime-env";
import React, { ReactNode, createContext, useContext } from "react";

// Define the context type
type IndexerContextType = {
  indexerPort: string;
};

// Create the context with a default value
const IndexerContext = createContext<IndexerContextType>({
  indexerPort: "7777", // Default fallback value
});

// Custom hook to use the indexer context
export function useIndexer() {
  return useContext(IndexerContext);
}

// Provider props type
type IndexerProviderProps = {
  children: ReactNode;
  serverIndexerPort?: string; // Optional prop to pass server-side value
};

// Provider component
export function IndexerProvider({ children, serverIndexerPort }: IndexerProviderProps) {
  // Use the server-provided port if available, otherwise try to get it from env
  const indexerPort = serverIndexerPort || env("NEXT_PUBLIC_INDEXER_PORT") || "7777";

  return <IndexerContext.Provider value={{ indexerPort }}>{children}</IndexerContext.Provider>;
}
