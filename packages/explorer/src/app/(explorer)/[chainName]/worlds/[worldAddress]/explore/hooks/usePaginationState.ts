import { parseAsInteger, useQueryState } from "nuqs";
import { useCallback } from "react";
import { PaginationState } from "@tanstack/react-table";

type UsePaginationStateReturn = [PaginationState, (pagination: PaginationState) => void];

export function usePaginationState(defaultPageSize = 10): UsePaginationStateReturn {
  const [pageIndex, setPageIndex] = useQueryState("page", parseAsInteger.withDefault(0));
  const [pageSize, setPageSize] = useQueryState("pageSize", parseAsInteger.withDefault(defaultPageSize));
  const pagination: PaginationState = { pageIndex, pageSize };

  const setPagination = useCallback(
    (pagination: PaginationState) => {
      setPageIndex(pagination.pageIndex);
      setPageSize(pagination.pageSize);
    },
    [setPageIndex, setPageSize],
  );

  return [pagination, setPagination];
}
