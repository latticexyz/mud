import { parseAsJson, useQueryState } from "nuqs";
import { PaginationState } from "@tanstack/react-table";

export function usePaginationQueryState(defaultPageSize = 10) {
  return useQueryState(
    "pagination",
    parseAsJson<PaginationState>().withDefault({
      pageIndex: 0,
      pageSize: defaultPageSize,
    }),
  );
}
