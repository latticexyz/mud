import { Table } from "@latticexyz/store";
import { useDevToolsContext } from "../DevToolsContext";
import { useEffect, useState } from "react";
import { TableRecord } from "@latticexyz/store-sync/zustand";

export function useRecords<table extends Table>(table: table): TableRecord<table>[] {
  const { useStore } = useDevToolsContext();
  if (!useStore) throw new Error("Missing useStore");

  // React doesn't like using hooks from another copy of React libs, so we have to use the non-React API to get data out of Zustand
  const [records, setRecords] = useState<{ readonly [k: string]: TableRecord<table> }>(
    useStore.getState().getRecords(table)
  );
  useEffect(() => {
    return useStore.subscribe((state) => {
      const nextRecords = useStore.getState().getRecords(table);
      if (nextRecords !== records) {
        setRecords(nextRecords);
      }
    });
  }, [useStore, records]);

  return Object.values(records);
}
