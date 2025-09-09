import { ReactNode } from "react";
import { EnvProvider } from "./EnvProvider";

type ServerEnvProviderProps = {
  children: ReactNode;
};

export function ServerEnvProvider({ children }: ServerEnvProviderProps) {
  const env = {
    DEV_INDEXER_PORT: process.env.DEV_INDEXER_PORT || "3001",
    CHAIN_ID: process.env.CHAIN_ID || "31337",
    INDEXER_URL: process.env.INDEXER_URL || "",
  };

  return <EnvProvider env={env}>{children}</EnvProvider>;
}
