import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { setup, SetupResult } from "./mud/setup";
import { usePromise } from "@latticexyz/react";

const MUDContext = createContext<SetupResult | null>(null);

type Props = {
  children: ReactNode;
};

export const MUDProvider = ({ children }: Props) => {
  const currentValue = useContext(MUDContext);
  if (currentValue) throw new Error("MUDProvider can only be used once");

  // const setupResult = usePromise(setup());

  // if (setupResult.status === "rejected") throw new Error("Ecountered error while setting up MUD");

  // if (setupResult.status !== "fulfilled") return;

  const [setupResult, setSetupResult] = useState<Awaited<ReturnType<typeof setup>> | null>(null);

  useEffect(() => {
    setup().then((response) => setSetupResult(response));
  }, []);

  return setupResult ? <MUDContext.Provider value={setupResult}>{children}</MUDContext.Provider> : null;
};

export const useMUD = () => {
  const value = useContext(MUDContext);
  if (!value) throw new Error("Must be used within a MUDProvider");
  return value;
};
