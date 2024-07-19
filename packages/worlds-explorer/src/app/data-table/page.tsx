"use client";

import { useEffect, useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpDown } from "lucide-react";

function bufferToBigInt(bufferData: number[]) {
  const hexString = bufferData.map((byte) => byte.toString(16).padStart(2, "0")).join("");
  const bigIntValue = BigInt("0x" + hexString);
  return bigIntValue;
}

function TableSelector({
  value,
  onChange,
  options,
}: {
  value: string | undefined;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div className="py-4">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select a table ..." />
        </SelectTrigger>
        <SelectContent>
          {options?.map((option) => {
            return (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}

function SQLEditor({
  table,
  setQuery,
  tablesLoading,
}: {
  table: string | undefined;
  setQuery: React.Dispatch<React.SetStateAction<string | undefined>>;
  tablesLoading: boolean;
}) {
  const [deferredQuery, setDeferredQuery] = useState<string | undefined>("");

  const submitQuery = (evt) => {
    evt.preventDefault();
    setQuery(deferredQuery);
  };

  useEffect(() => {
    if (table) {
      const initialQuery = `SELECT * FROM '${table}' LIMIT 30`;
      setQuery(initialQuery);
      setDeferredQuery(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, tablesLoading]);

  return (
    <form onSubmit={submitQuery}>
      {/* <Flex direction="row" gap="2">
        <TextField.Root
          style={{ flex: "1" }}
          placeholder="SQL query…"
          value={deferredQuery}
          onChange={(evt) => setDeferredQuery(evt.target.value)}
        >
          <TextField.Slot></TextField.Slot>
        </TextField.Root>

        <Button type="submit">Execute query</Button>
      </Flex> */}
    </form>
  );
}

function TablesViewer({ table: selectedTable, query }: { table: string | undefined; query: string | undefined }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

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
      header: ({ column }) => {
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
      cell: ({ row }) => <div className="capitalize">{row.getValue(name)}</div>,
    };
  });

  const table = useReactTable({
    data: rows,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  console.log("schema", schema);
  console.log("rows", rows);

  if (!schema || !rows) {
    return <div>Loading...</div>;
  }

  return (
    <>
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
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s)
          selected.
        </div>
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

export default function DataExplorer() {
  const [selectedTable, setSelectedTable] = useState<string | undefined>();
  const [query, setQuery] = useState<string | undefined>();

  const { data: tables, isLoading: tablesLoading } = useQuery({
    queryKey: ["tables"],
    queryFn: async () => {
      const response = await fetch("/api/tables");
      return response.json();
    },
    select: (data) => data.tables.map((table: { name: string }) => table.name),
    refetchInterval: 15000,
  });

  // Fetch tables, and select the first table if none is selected
  useEffect(() => {
    if (!selectedTable && tables) {
      setSelectedTable(tables[0]);
    }
  }, [selectedTable, tables]);

  return (
    <>
      <h1 className="text-4xl font-bold py-4">Data explorer</h1>
      <div className="w-full">
        <TableSelector value={selectedTable} onChange={setSelectedTable} options={tables} />
        <SQLEditor table={selectedTable} tablesLoading={tablesLoading} setQuery={setQuery} />
        <TablesViewer table={selectedTable} query={query} />
      </div>
    </>
  );
}
