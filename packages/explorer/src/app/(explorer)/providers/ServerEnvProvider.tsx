import { ReactNode } from "react";
import { EnvProvider } from "./EnvProvider";

type ServerEnvProviderProps = {
  children: ReactNode;
};

export function ServerEnvProvider({ children }: ServerEnvProviderProps) {
  const env = {
    INDEXER_PORT: process.env.INDEXER_PORT || "3001",
    CHAIN_ID: process.env.CHAIN_ID || "31337",
  };

  return <EnvProvider env={env}>{children}</EnvProvider>;
}
