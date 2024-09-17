import { ArrowUpDown, Loader } from "lucide-react";
import { useMemo, useState } from "react";
import { internalTableNames } from "@latticexyz/store-sync/sqlite";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "../../../../../../components/ui/Button";
import { Input } from "../../../../../../components/ui/Input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../../../components/ui/Table";
import { Table as TableType } from "../../../../../../queries/dozer/useTablesQuery";
import { EditableTableCell } from "./EditableTableCell";

type Props = {
  config: TableType | undefined;
  table: string | undefined;
  rows: Record<string, string>[] | undefined;
  columns: string[] | undefined;
};

export function TablesViewer({ table: selectedTable, config, rows, columns }: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");

  const tableColumns: ColumnDef<Record<string, string>>[] = useMemo(() => {
    if (!config) return [];

    return (
      Object.keys(config.schema)
        // Filter by query columns. Note: columns fetched from dozer are lowercase.
        .filter((name) => columns?.includes(name.toLowerCase()))
        .map((name) => {
          const type = config.schema[name];
          return {
            accessorKey: name,
            header: ({ column }) => {
              return (
                <Button
                  variant="ghost"
                  className="-ml-4"
                  onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                  <span className="text-orange-500">{name}</span>
                  <span className="ml-1 opacity-70">({type})</span>
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              );
            },
            cell: ({
              row,
            }: {
              row: {
                getValue: (name: string) => string;
              };
            }) => {
              const keysSchema = Object.keys(config?.keySchema || {});
              const keysTuple = keysSchema?.map((key) => row.getValue(key));
              const value = row.getValue(name)?.toString();

              if (
                (selectedTable && (internalTableNames as string[]).includes(selectedTable)) ||
                keysSchema.includes(name)
              ) {
                return value;
              }

              // TODO: add `animate-fade-in`
              return <EditableTableCell config={config} keysTuple={keysTuple} name={name} value={value} />;
            },
          };
        })
    );
  }, [columns, config, selectedTable]);

  const table = useReactTable({
    data: rows || [],
    columns: tableColumns,
    initialState: {
      pagination: {
        pageSize: 50,
      },
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  });

  if (!config || !rows) {
    return (
      <div className="rounded-md border p-4">
        <Loader className="animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between gap-4 pb-4">
        <Input
          placeholder="Filter ..."
          value={globalFilter ?? ""}
          onChange={(event) => table.setGlobalFilter(event.target.value)}
          className="max-w-sm rounded border px-2 py-1"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      </div>
    </>
  );
}
