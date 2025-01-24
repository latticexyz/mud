import { useConnectors } from "wagmi";
import { JwtConnector, jwtConnector } from "./jwt/jwtConnector";

export function useJwtConnector(): JwtConnector {
  const connectors = useConnectors();
  const connector = connectors.find((c) => c.type === jwtConnector.type);
  if (!connector) {
    throw new Error("Could not find jwt connector.");
  }
  return connector as never;
}
