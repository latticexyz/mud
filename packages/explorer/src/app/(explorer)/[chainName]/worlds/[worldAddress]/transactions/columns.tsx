import { ChevronsUpDownIcon } from "lucide-react";
import { createColumnHelper } from "@tanstack/react-table";
import { Badge } from "../../../../../../components/ui/Badge";
import { TruncatedHex } from "../../../../../../components/ui/TruncatedHex";
import { TimeAgoCell } from "./TimeAgoCell";
import { WatchedTransaction } from "./TransactionsTable";

const columnHelper = createColumnHelper<WatchedTransaction>();
export const columns = [
  columnHelper.accessor("transaction.blockNumber", {
    header: "",
    cell: (row) => <Badge variant="outline">#{row.getValue()?.toString()}</Badge>,
  }),
  columnHelper.accessor("hash", {
    header: "tx hash:",
    cell: (row) => <TruncatedHex hex={row.getValue()} />,
  }),
  columnHelper.accessor("functionData.functionName", {
    header: "function:",
    cell: (row) => <Badge variant="secondary">{row.getValue()}</Badge>,
  }),
  columnHelper.accessor("transaction.from", {
    header: "from:",
    cell: (row) => {
      const from = row.getValue();
      if (!from) return null;
      return <TruncatedHex hex={from} />;
    },
  }),
  columnHelper.accessor("status", {
    header: "status:",
    cell: (row) => {
      const status = row.getValue();
      if (status === "success") {
        return <Badge variant="success">success</Badge>;
      } else if (status === "failed") {
        return <Badge variant="destructive">failed</Badge>;
      }
      return <Badge variant="outline">pending</Badge>;
    },
  }),
  columnHelper.accessor("timestamp", {
    header: "time ago:",
    cell: (row) => {
      const timestamp = row.getValue();
      return <TimeAgoCell timestamp={timestamp} />;
    },
  }),
  columnHelper.accessor("expand", {
    header: "",
    cell: () => <ChevronsUpDownIcon className="h-4 w-4" />,
  }),
];
