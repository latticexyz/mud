import { Table } from "@latticexyz/store";
import { useDevToolsContext } from "../DevToolsContext";
import { useEffect, useState } from "react";

export function useTables(): Table[] {
  const { useStore } = useDevToolsContext();
  if (!useStore) throw new Error("Missing useStore");

  // React doesn't like using hooks from another copy of React libs, so we have to use the non-React API to get data out of Zustand
  const [tables, setTables] = useState<{ readonly [k: string]: Table }>(useStore.getState().tables);
  useEffect(() => {
    return useStore.subscribe((state) => {
      if (state.tables !== tables) {
        setTables(state.tables);
      }
    });
  }, [useStore, tables]);

  return Object.values(tables);
}
