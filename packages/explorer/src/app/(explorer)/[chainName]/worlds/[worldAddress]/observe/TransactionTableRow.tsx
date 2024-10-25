import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { formatEther } from "viem";
import { Row, flexRender } from "@tanstack/react-table";
import { Separator } from "../../../../../../components/ui/Separator";
import { Skeleton } from "../../../../../../components/ui/Skeleton";
import { TableCell, TableRow } from "../../../../../../components/ui/Table";
import { cn } from "../../../../../../utils";
import { Confirmations } from "./Confirmations";
import { TimingRowExpanded } from "./TimingRowExpanded";
import { columns } from "./TransactionsTable";
import { ObservedTransaction } from "./useObservedTransactions";

function TransactionTableRowDataCell({
  label,
  status,
  children,
}: {
  label: string;
  status: ObservedTransaction["status"];
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-2xs font-bold uppercase text-white/60">{label}</h3>
      <p className="pt-1 text-xs uppercase">
        {children ??
          (status === "rejected" ? <span className="text-white/60">N/A</span> : <Skeleton className="h-4 w-[100px]" />)}
      </p>
    </div>
  );
}

export function TransactionTableRow({ row }: { row: Row<ObservedTransaction> }) {
  const data = row?.original;
  const status = data.status;
  const logs = data?.logs;
  const receipt = data?.receipt;

  return (
    <>
      <TableRow
        className={cn("relative cursor-pointer", {
          "bg-muted/50": row.getIsExpanded(),
        })}
        onClick={() => row.toggleExpanded()}
      >
        {row.getVisibleCells().map((cell) => (
          <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
        ))}

        {row.getIsExpanded() ? (
          <ChevronUpIcon className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
        ) : (
          <ChevronDownIcon className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
        )}
      </TableRow>

      {row.getIsExpanded() && (
        <TableRow className="border-b-white/20 bg-muted/50 hover:bg-muted/50">
          <TableCell colSpan={columns.length}>
            {data && (
              <>
                <div className="grid grid-cols-2 gap-x-2 gap-y-5 sm:grid-cols-4 md:grid-cols-5">
                  <TransactionTableRowDataCell label="Confirmations" status={status}>
                    {status !== "rejected" ? <Confirmations hash={data.transaction?.hash} /> : null}
                  </TransactionTableRowDataCell>
                  <TransactionTableRowDataCell label="Tx value" status={status}>
                    {data.value ? formatEther(data.value) : 0} ETH
                  </TransactionTableRowDataCell>
                  <TransactionTableRowDataCell label="Gas used" status={status}>
                    {receipt?.gasUsed.toString()}
                  </TransactionTableRowDataCell>
                  <TransactionTableRowDataCell label="Gas price" status={status}>
                    {receipt?.effectiveGasPrice.toString()}
                  </TransactionTableRowDataCell>
                  <TransactionTableRowDataCell label="Tx cost" status={status}>
                    {receipt ? `${formatEther(receipt.gasUsed * receipt.effectiveGasPrice)} ETH` : null}
                  </TransactionTableRowDataCell>
                </div>

                <Separator className="my-5" />
                <div className="flex items-start gap-x-4">
                  <h3 className="w-[45px] flex-shrink-0 text-2xs font-bold uppercase">Inputs</h3>

                  {data.calls && data.calls.length > 0 ? (
                    <div className="flex w-full flex-col gap-y-4">
                      {data.calls.map((call, idx) => {
                        return (
                          <div key={idx} className="min-w-0 flex-grow border border-white/20 p-2 pt-1">
                            <span className="text-xs">{call.functionName}:</span>
                            {call.args?.map((arg, idx) => (
                              <div key={idx} className="flex">
                                <span className="flex-shrink-0 text-xs text-white/60">arg {idx + 1}:</span>
                                <span className="ml-2 break-all text-xs">
                                  {typeof arg === "object" && arg !== null ? JSON.stringify(arg, null, 2) : String(arg)}
                                </span>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-2xs uppercase text-white/60">No inputs</p>
                  )}
                </div>

                {data.error ? (
                  <>
                    <Separator className="my-5" />
                    <div className="flex items-start gap-x-4">
                      <h3 className="w-[45px] flex-shrink-0 text-2xs font-bold uppercase">Error</h3>
                      <div className="flex-grow whitespace-pre-wrap border border-red-500 p-2 font-mono text-xs">
                        {data.error.message}
                      </div>
                    </div>
                  </>
                ) : null}

                {!data.error ? (
                  <>
                    <Separator className="my-5" />
                    <div className="flex items-start gap-x-4">
                      <h3 className="inline-block w-[45px] flex-shrink-0 text-2xs font-bold uppercase">Logs</h3>
                      {Array.isArray(logs) && logs.length > 0 ? (
                        <div className="flex-grow break-all border border-white/20 p-2 pb-3">
                          <ul>
                            {logs.map((log, idx) => {
                              const eventName = "eventName" in log ? log.eventName : null;
                              const args = "args" in log ? (log.args as Record<string, unknown>) : null;
                              return (
                                <li key={idx}>
                                  {Boolean(eventName) && <span className="text-xs">{eventName?.toString()}:</span>}
                                  {args && (
                                    <ul className="list-inside">
                                      {Object.entries(args).map(([key, value]) => (
                                        <li key={key} className="mt-1 flex">
                                          <span className="flex-shrink-0 text-xs text-white/60">{key}: </span>
                                          <span className="ml-2 break-all text-xs">{String(value)}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                  {idx < logs.length - 1 && <Separator className="my-4" />}
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      ) : status === "pending" ? (
                        <Skeleton className="h-4 w-full" />
                      ) : (
                        <p className="text-2xs uppercase text-white/60">No logs</p>
                      )}
                    </div>
                  </>
                ) : null}

                {data.write && <TimingRowExpanded {...data.write} />}
              </>
            )}
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
