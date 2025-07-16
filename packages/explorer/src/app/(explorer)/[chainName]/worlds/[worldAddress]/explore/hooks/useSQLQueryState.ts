import { parseAsString, useQueryState } from "nuqs";

type UseSQLQueryStateReturn = [string, (value: string) => void];

export function useSQLQueryState(): UseSQLQueryStateReturn {
  const [query, setQuery] = useQueryState("query", parseAsString.withDefault(""));
  return [decodeURIComponent(query), setQuery];
}
