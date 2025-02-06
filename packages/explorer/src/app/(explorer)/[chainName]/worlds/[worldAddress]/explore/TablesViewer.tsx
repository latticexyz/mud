import {
  ArrowUpDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  KeyIcon,
  LoaderIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { parseAsInteger, parseAsJson, parseAsString, useQueryState } from "nuqs";
import { useEffect, useMemo, useState } from "react";
import { Table as TableType } from "@latticexyz/config";
import { getKeySchema, getKeyTuple } from "@latticexyz/protocol-parser/internal";
import {
  ColumnDef,
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
import { EditableTableCell } from "./EditableTableCell";
import { ExportButton } from "./ExportButton";
import { typeSortingFn } from "./utils/typeSortingFn";

const initialSortingState: SortingState = [];
const initialRows: TData["rows"] = [];

type Props = {
  table?: TableType;
  query?: string;
  isLiveQuery: boolean;
};

export function TablesViewer({ table, query, isLiveQuery }: Props) {
  const { id: chainId } = useChain();
  const indexer = indexerForChainId(chainId);
  const { data: tableData, isPending, isError, error } = useTableDataQuery({ table, query, isLiveQuery });
  const [globalFilter, setGlobalFilter] = useQueryState("filter", parseAsString.withDefault(""));
  const [sorting, setSorting] = useQueryState("sort", parseAsJson<SortingState>().withDefault(initialSortingState));

  const [, setPage] = useQueryState("page", parseAsInteger.withDefault(0));
  const [, setPageSize] = useQueryState("pageSize", parseAsInteger.withDefault(10));
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  useEffect(() => {
    setPage(pagination.pageIndex);
    setPageSize(pagination.pageSize);
  }, [pagination, setPage, setPageSize]);

  // TODO: fetch actual total rows
  const TOTAL_ROWS = 22;

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
        cell: ({ row }) => {
          const keySchema = getKeySchema(table);
          const value = row.getValue(name);
          if (!table || Object.keys(keySchema).includes(name)) {
            return value;
          }

          try {
            const keyTuple = getKeyTuple(table, row.original as never);
            return <EditableTableCell name={name} table={table} value={value} keyTuple={keyTuple} />;
          } catch (e) {
            return value;
          }
        },
      };
    });
  }, [table, tableData]);

  const reactTable = useReactTable({
    data: tableData?.rows ?? initialRows,
    columns: tableColumns,
    initialState: {
      pagination: {
        pageSize: pagination.pageSize,
      },
    },
    manualPagination: true,
    rowCount: TOTAL_ROWS,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
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
  });

  console.log(pagination);

  return (
    <div
      className={cn("space-y-4", {
        "!-mt-10": indexer.type === "hosted",
      })}
    >
      <div className="flex w-1/2 items-center gap-4">
        <Input
          placeholder="Filter..."
          value={globalFilter}
          onChange={(event) => reactTable.setGlobalFilter(event.target.value)}
          className="max-w-sm rounded border px-2 py-1"
          disabled={!tableData}
        />

        <ExportButton tableData={tableData} isLoading={isPending} />
      </div>

      <div
        className={cn("rounded-md border", {
          "border-red-400": isError,
        })}
      >
        {isPending && (
          <div className="flex h-24 items-center justify-center">
            <LoaderIcon className="h-5 w-5 animate-spin" />
          </div>
        )}
        {!isPending && (
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
              <TableBody>
                {!isError && reactTable.getRowModel().rows?.length ? (
                  reactTable.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                      ))}
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
        )}
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm">
          {tableData && (
            <>
              <span className="text-muted-foreground">Total</span> {TOTAL_ROWS}
            </>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <p className="text-sm text-muted-foreground">Rows per page</p>
          <Select
            value={pagination.pageSize.toString()}
            onValueChange={(value) => {
              reactTable.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue>{pagination.pageSize}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={pageSize.toString()}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => reactTable.previousPage()}
              disabled={!reactTable.getCanPreviousPage()}
              className="h-8 w-8 p-0 hover:bg-accent"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.ceil(TOTAL_ROWS / pagination.pageSize) }, (_, i) => (
                <Button
                  key={i}
                  variant={pagination.pageIndex === i ? "outline" : "ghost"}
                  size="sm"
                  onClick={() => reactTable.setPageIndex(i)}
                  className={cn("h-8 w-8 p-0 hover:bg-transparent", {
                    "hover:bg-accent": pagination.pageIndex !== i,
                  })}
                >
                  {i + 1}
                </Button>
              ))}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => reactTable.nextPage()}
              disabled={!reactTable.getCanNextPage()}
              className="h-8 w-8 p-0 hover:bg-accent"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
