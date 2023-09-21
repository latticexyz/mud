import { createContext, ReactNode, useContext, useState, useEffect, useMemo } from "react";
import { setup, SetupResult } from "./mud/setup";
import { usePromise } from "@latticexyz/react";

const MUDContext = createContext<SetupResult | null>(null);

type Props = {
  children: ReactNode;
};

// THis is not used. Context doesn't play well with async data fetch so used hook instead
export const MUDProvider = ({ children }: Props) => {
  const currentValue = useContext(MUDContext);
  if (currentValue) throw new Error("MUDProvider can only be used once");

  // Had weird re-rendering issue with the approach below
  // const setupResult = usePromise(setup());

  // if (setupResult.status === "rejected") throw new Error("Ecountered error while setting up MUD");

  // if (setupResult.status !== "fulfilled") return;
  const setupPromise = useMemo(() => {
    return setup();
  }, []);

  const [setupResult, setSetupResult] = useState<Awaited<ReturnType<typeof setup>> | null>(null);

  useEffect(() => {
    setupPromise.then((result) => setSetupResult(result));

    return () => {
      setupPromise.then((result) => result.network.world.dispose());
    };
  }, [setupPromise]);

  return <MUDContext.Provider value={setupResult}>{children}</MUDContext.Provider>;
};

export const useMUD = () => {
  const value = useContext(MUDContext);
  return value;
};
