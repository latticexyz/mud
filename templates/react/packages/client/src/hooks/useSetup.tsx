import { useEffect, useMemo } from "react";
import { usePromiseValue } from "./usePromiseValue";
import { setup } from "../mud/setup";

export const useSetup = () => {
  const setupPromise = useMemo(() => {
    return setup();
  }, []);

  useEffect(() => {
    return () => {
      setupPromise.then((result) => result.network.world.dispose());
    };
  }, [setupPromise]);

  return usePromiseValue(setupPromise);
};
