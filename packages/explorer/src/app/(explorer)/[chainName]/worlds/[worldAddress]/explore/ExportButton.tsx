import { DownloadIcon } from "lucide-react";
import { Button } from "../../../../../../components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../../../../components/ui/DropdownMenu";
import { TData } from "../../../../queries/useTableDataQuery";
import { exportTableData } from "./utils/exportTableData";

export function ExportButton({ tableData, isLoading }: { tableData?: TData; isLoading: boolean }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={!tableData || isLoading}>
          <DownloadIcon className="mr-2 h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          onClick={() => {
            const csv = tableData?.rows.map((row) => tableData.columns.map((col) => row[col]).join(",")).join("\n");
            const header = tableData?.columns.join(",") + "\n";
            exportTableData(header + csv, "data.csv", "text/csv");
          }}
        >
          CSV
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            const json = JSON.stringify(tableData?.rows, null, 2);
            exportTableData(json, "data.json", "application/json");
          }}
        >
          JSON
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            const txt = tableData?.rows.map((row) => tableData.columns.map((col) => row[col]).join("\t")).join("\n");
            const header = tableData?.columns.join("\t") + "\n";
            exportTableData(header + txt, "data.txt", "text/plain");
          }}
        >
          TXT
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
