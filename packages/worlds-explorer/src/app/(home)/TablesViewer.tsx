import { useState } from "react";
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
import { useQuery } from "@tanstack/react-query";
import { ArrowUpDown, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { bufferToBigInt } from "./utils/bufferToBigInt";
import { Input } from "@/components/ui/input";

export function TablesViewer({
  table: selectedTable,
  query,
}: {
  table: string | undefined;
  query: string | undefined;
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");

  const { data: schema } = useQuery({
    queryKey: ["schema", { table: selectedTable }],
    queryFn: async () => {
      const response = await fetch(`/api/schema?table=${selectedTable}`);
      return response.json();
    },
    select: (data) => {
      return data.schema.filter((column: { name: string }) => {
        return !column.name.startsWith("__");
      });
    },
  });

  const { data: rows } = useQuery({
    queryKey: ["rows", { query }],
    queryFn: async () => {
      const response = await fetch(`/api/rows?query=${query}`);
      return response.json();
    },
    select: (data) => {
      return data.rows.map((row: object) => {
        return Object.fromEntries(
          Object.entries(row).map(([key, value]) => {
            if (value?.type === "Buffer") {
              return [key, bufferToBigInt(value?.data).toString()];
            }
            return [key, value];
          }),
        );
      });
    },
    enabled: Boolean(selectedTable) && Boolean(query),
    refetchInterval: 1000,
  });

  const columns: ColumnDef<{}>[] = schema?.map(({ name, type }: { name: string; type: string }) => {
    return {
      accessorKey: name,
      header: ({
        column,
      }: {
        column: {
          toggleSorting: (ascending: boolean) => void;
          getIsSorted: () => "asc" | "desc" | undefined;
        };
      }) => {
        return (
          <Button
            variant="ghost"
            className="-ml-4"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {name} ({type})
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
        // TODO: editable row
        // return <input className="bg-transparent" defaultValue={row.getValue(name)} />;
        return row.getValue(name);
      },
    };
  });

  const table = useReactTable({
    data: rows,
    columns,
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

  if (!schema || !rows) {
    return (
      <div className="rounded-md border p-4">
        <Loader className="animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="pb-4">
        <Input
          placeholder="Filter all columns..."
          value={globalFilter ?? ""}
          onChange={(event) => table.setGlobalFilter(event.target.value)}
          className="max-w-sm border rounded px-2 py-1"
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
