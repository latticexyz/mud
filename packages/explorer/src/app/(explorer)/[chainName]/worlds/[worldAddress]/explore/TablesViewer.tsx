import { ArrowUpDown, Loader } from "lucide-react";
import { useMemo, useState } from "react";
import { Schema } from "@latticexyz/config";
import { getSchemaPrimitives } from "@latticexyz/protocol-parser/internal";
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
import { internalNamespaces } from "../../../../../../common";
import { Button } from "../../../../../../components/ui/Button";
import { Input } from "../../../../../../components/ui/Input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../../../components/ui/Table";
import { DeployedTable } from "../api/utils/decodeTable";
import { useTableDataQuery } from "../queries/useTableDataQuery";
import { EditableTableCell } from "./EditableTableCell";

type Props = {
  data: ReturnType<typeof useTableDataQuery>["data"] | undefined;
  deployedTable: DeployedTable | undefined;
};

export function TablesViewer({ data, deployedTable }: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");

  const tableColumns: ColumnDef<getSchemaPrimitives<Schema>>[] = useMemo(() => {
    if (!deployedTable) return [];

    const columns = Object.keys(deployedTable.schema);
    return (
      columns
        // Filter by query columns. Note: columns fetched from dozer are lowercase.
        .filter((name) => columns.includes(name) || columns.includes(name.toLowerCase()))
        .map((name) => {
          const type = deployedTable.schema[name].type;
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
              const namespace = deployedTable?.namespace;
              const keysSchema = Object.keys(deployedTable?.keySchema || {});
              const keyTuple = keysSchema?.map((key) => row.getValue(key));
              const value = row.getValue(name)?.toString();

              if (keysSchema.includes(name) || internalNamespaces.includes(namespace)) {
                return value;
              }
              return <EditableTableCell name={name} deployedTable={deployedTable} keyTuple={keyTuple} value={value} />;
            },
          };
        })
    );
  }, [deployedTable]);

  const table = useReactTable({
    data: data || [],
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

  if (!deployedTable || !data) {
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
                <TableCell colSpan={tableColumns.length} className="h-24 text-center">
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
