import {
  ArrowUpDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  KeyIcon,
  LoaderIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { parseAsJson, parseAsString, useQueryState } from "nuqs";
import { useCallback, useMemo } from "react";
import { Table as TableType } from "@latticexyz/config";
import { getKeySchema } from "@latticexyz/protocol-parser/internal";
import {
  ColumnDef,
  OnChangeFn,
  PaginationState,
  RowData,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "../../../../../../components/ui/Button";
import { Input } from "../../../../../../components/ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../../../components/ui/Select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../../../components/ui/Table";
import { cn } from "../../../../../../utils";
import { useChain } from "../../../../hooks/useChain";
import { TData, TDataRow, useTableDataQuery } from "../../../../queries/useTableDataQuery";
import { indexerForChainId } from "../../../../utils/indexerForChainId";
import { ExportButton } from "./ExportButton";
import { PAGE_SIZE_OPTIONS } from "./consts";
import { defaultColumn } from "./defaultColumn";
import { usePaginationState } from "./hooks/usePaginationState";
import { useSQLQueryState } from "./hooks/useSQLQueryState";
import { getLimitOffset } from "./utils/getLimitOffset";
import { typeSortingFn } from "./utils/typeSortingFn";

const initialSortingState: SortingState = [];
const initialRows: TData["rows"] = [];

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData extends RowData> {
    tableConfig?: TableType;
  }
}

type Props = {
  table?: TableType;
  query?: string;
  isLiveQuery: boolean;
};

export function TablesViewer({ table, isLiveQuery }: Props) {
  const { id: chainId } = useChain();
  const indexer = indexerForChainId(chainId);
  const [query, setQuery] = useSQLQueryState();
  const [globalFilter, setGlobalFilter] = useQueryState("filter", parseAsString.withDefault(""));
  const [sorting, setSorting] = useQueryState("sort", parseAsJson<SortingState>().withDefault(initialSortingState));
  const [pagination, setPagination] = usePaginationState();
  const { data: tableData, isPending, isFetching, isError, error } = useTableDataQuery({ table, query, isLiveQuery });
  const isLoading = isPending || (isFetching && !isLiveQuery);

  const handlePaginationChange: OnChangeFn<PaginationState> = useCallback(
    (updater) => {
      const newPaginationState = typeof updater === "function" ? updater(pagination) : updater;
      const { pageIndex: newPageIndex, pageSize: newPageSize } = newPaginationState;
      setPagination(newPaginationState);

      const decodedQuery = decodeURIComponent(query);
      const updatedQuery = decodedQuery.replace(
        /LIMIT\s+\d+\s+OFFSET\s+\d+/i,
        `LIMIT ${newPageSize} OFFSET ${newPageIndex * newPageSize}`,
      );
      setQuery(updatedQuery);

      return newPaginationState;
    },
    [pagination, setPagination, query, setQuery],
  );

  const tableColumns: ColumnDef<TDataRow>[] = useMemo(() => {
    if (!table || !tableData) return [];

    return tableData.columns.map((name) => {
      const schema = table?.schema[name];
      const type = schema?.type;
      const keySchema = getKeySchema(table);
      return {
        accessorKey: name,
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              className="-ml-4"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              {name in keySchema && <KeyIcon className="mr-2 h-3 w-3" />}
              <span className="text-orange-500">{name}</span>
              {type && <span className="ml-1 opacity-70">({type})</span>}
              <ArrowUpDownIcon className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        sortingFn: (rowA, rowB, columnId) => typeSortingFn(rowA, rowB, columnId, type),
      };
    });
  }, [table, tableData]);

  const reactTable = useReactTable({
    data: tableData?.rows ?? initialRows,
    columns: tableColumns,
    defaultColumn,
    initialState: {
      pagination: {
        pageSize: pagination.pageSize,
      },
    },
    manualPagination: true,
    pageCount: -1,
    onSortingChange: setSorting,
    onPaginationChange: handlePaginationChange,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    state: {
      sorting,
      globalFilter,
      pagination,
    },
    meta: {
      tableConfig: table,
    },
  });

  // Pagination is only enabled if the query has a LIMIT and OFFSET that are divisible by the page size
  const isPaginationEnabled = useMemo(() => {
    if (!query) return false;

    const { limit, offset } = getLimitOffset(query);
    if (limit == null || offset == null) return false;

    return PAGE_SIZE_OPTIONS.includes(limit) && offset % pagination.pageSize === 0;
  }, [pagination.pageSize, query]);

  return (
    <div
      className={cn("space-y-4", {
        "!-mt-10": indexer.type === "hosted",
      })}
    >
      <div className="flex w-1/2 items-center gap-4">
        <Input
          type="search"
          placeholder="Filter..."
          value={globalFilter}
          onChange={(event) => reactTable.setGlobalFilter(event.target.value)}
          className="max-w-xs rounded border px-2 py-1"
          disabled={!tableData}
        />

        <ExportButton tableData={tableData} isLoading={isPending} />
      </div>

      <div
        className={cn("relative rounded-md border", {
          "border-red-400": isError,
        })}
      >
        <div className="relative w-full overflow-auto">
          <Table>
            <TableHeader>
              {!isError &&
                reactTable.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
            </TableHeader>

            <TableBody className="relative">
              {isLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                  <LoaderIcon className="h-5 w-5 animate-spin" />
                </div>
              )}
              {!isError && reactTable.getRowModel().rows?.length ? (
                reactTable.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => {
                      return (
                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                      );
                    })}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={tableColumns.length}
                    className={cn("h-24 text-center", {
                      "text-red-400": isError,
                    })}
                  >
                    {isError ? (
                      <div className="flex items-center justify-center gap-x-2">
                        <TriangleAlertIcon /> Query error: {error.message}
                      </div>
                    ) : (
                      "No results."
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex items-center justify-end space-x-2 pb-4">
        <div className="mr-4 flex items-center gap-2">
          <p className="text-sm text-muted-foreground">Per page:</p>
          <Select
            value={pagination.pageSize.toString()}
            onValueChange={(value) => reactTable.setPageSize(Number(value))}
            disabled={!isPaginationEnabled}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue>{pagination.pageSize}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((pageSize) => (
                <SelectItem key={pageSize} value={pageSize.toString()}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-end space-x-2">
          <span className="mr-1 text-sm text-muted-foreground">Page {pagination.pageIndex + 1}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => reactTable.setPageIndex(0)}
            disabled={!isPaginationEnabled || !reactTable.getCanPreviousPage()}
          >
            <ChevronsLeftIcon className="mr-1 h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => reactTable.previousPage()}
            disabled={!isPaginationEnabled || !reactTable.getCanPreviousPage()}
          >
            <ChevronLeftIcon className="mr-1 h-4 w-4" /> Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => reactTable.nextPage()}
            disabled={
              !isPaginationEnabled ||
              !reactTable.getCanNextPage() ||
              !tableData ||
              tableData.rows.length < pagination.pageSize
            }
          >
            Next <ChevronRightIcon className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
