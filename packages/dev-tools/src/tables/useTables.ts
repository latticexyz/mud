import { TableId, isDefined } from "@latticexyz/utils";
import { useStore } from "../useStore";

export function useTables() {
  const cacheStore = useStore((state) => state.cacheStore);
  if (!cacheStore) {
    return [];
  }
  return cacheStore.components
    .map((component) => {
      const tableId = TableId.parse(component);
      if (!tableId) return;
      return { component, tableId };
    })
    .filter(isDefined)
    .sort((a, b) => a.component.localeCompare(b.component));
}
