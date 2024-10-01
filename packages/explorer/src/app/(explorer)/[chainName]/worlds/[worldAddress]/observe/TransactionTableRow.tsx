import { Row, flexRender } from "@tanstack/react-table";
import { Separator } from "../../../../../../components/ui/Separator";
import { Skeleton } from "../../../../../../components/ui/Skeleton";
import { TableCell, TableRow } from "../../../../../../components/ui/Table";
import { Confirmations } from "./Confirmations";
import { WatchedTransaction } from "./TransactionsTableContainer";
import { columns } from "./TransactionsTableView";

function TranctionTableRowDataCell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-2xs font-bold uppercase text-muted-foreground">{label}</h3>
      <p className="pt-1 text-xs uppercase">{children ?? <Skeleton className="h-4 w-[100px]" />}</p>
    </div>
  );
}

export function TransactionTableRow({ row }: { row: Row<WatchedTransaction> }) {
  const data = row?.original;
  const logs = data?.logs;

  return (
    <>
      <TableRow className="cursor-pointer" onClick={() => row.toggleExpanded()}>
        {row.getVisibleCells().map((cell) => (
          <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
        ))}
      </TableRow>

      {row.getIsExpanded() && (
        <TableRow className="bg-muted/20 hover:bg-muted/20">
          <TableCell colSpan={columns.length}>
            {data && (
              <>
                <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
                  <TranctionTableRowDataCell label="Confirmations">
                    <Confirmations hash={data.transaction?.hash} />
                  </TranctionTableRowDataCell>
                  <TranctionTableRowDataCell label="Tx value">
                    {data.transaction?.value !== undefined ? `${data.transaction.value.toString()} ETH` : null}
                  </TranctionTableRowDataCell>
                </div>

                <Separator className="my-5" />

                <div className="flex items-start gap-x-4">
                  <h3 className="w-[45px] text-2xs font-bold uppercase">Inputs</h3>
                  {data.functionData?.args ? (
                    <div className="flex-grow border border-white/20 p-2">
                      {data.functionData?.args?.map((arg, idx) => (
                        <div key={idx} className="flex">
                          <span className="flex-shrink-0 text-xs text-muted-foreground">arg {idx + 1}:</span>
                          <span className="ml-2 text-xs">{String(arg)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-2xs uppercase text-muted-foreground">No inputs</p>
                  )}
                </div>

                <Separator className="my-5" />

                <div className="flex items-start gap-x-4">
                  <h3 className="inline-block w-[45px] pb-2 text-2xs font-bold uppercase">Logs</h3>
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
                                      <span className="flex-shrink-0 text-xs text-muted-foreground">{key}: </span>
                                      <span className="ml-2 text-xs">{value as never}</span>
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
                  ) : (
                    <p className="text-2xs uppercase text-muted-foreground">No logs</p>
                  )}
                </div>
              </>
            )}
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
