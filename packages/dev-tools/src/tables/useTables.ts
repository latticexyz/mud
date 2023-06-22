import { useStore } from "../useStore";

export function useTables() {
  const storeCacheClient = useStore((state) => state.storeCacheClient);
  console.log("storeCacheClient", storeCacheClient);
  if (!storeCacheClient) {
    return [];
  }
  const tables = Object.keys(storeCacheClient.tables);
  return tables.sort((a, b) => a.localeCompare(b));
}
