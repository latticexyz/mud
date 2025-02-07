import { parseAsString, useQueryState } from "nuqs";

export function useSQLQueryState() {
  const [query, setQuery] = useQueryState("query", parseAsString.withDefault(""));
  return {
    query: decodeURIComponent(query),
    setQuery: (value: string) => setQuery(encodeURIComponent(value)),
  };
}
