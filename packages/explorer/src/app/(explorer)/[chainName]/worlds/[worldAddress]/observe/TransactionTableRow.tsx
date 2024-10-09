import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { formatEther } from "viem";
import { Row, flexRender } from "@tanstack/react-table";
import { Separator } from "../../../../../../components/ui/Separator";
import { Skeleton } from "../../../../../../components/ui/Skeleton";
import { TableCell, TableRow } from "../../../../../../components/ui/Table";
import { type Write } from "../../../../../../observer/store";
import { cn } from "../../../../../../utils";
import { Confirmations } from "./Confirmations";
import { columns } from "./TransactionsTable";
import { WatchedTransaction } from "./useTransactionWatcher";

function TransactionTableRowDataCell({
  label,
  status,
  children,
}: {
  label: string;
  status: WatchedTransaction["status"];
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

export function TransactionTableRow({ row }: { row: Row<WatchedTransaction> }) {
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
                  {Array.isArray(data.functionData?.args) && data.functionData?.args.length > 0 ? (
                    <div className="flex-grow border border-white/20 p-2">
                      {data.functionData?.args?.map((arg, idx) => (
                        <div key={idx} className="flex">
                          <span className="flex-shrink-0 text-xs text-white/60">arg {idx + 1}:</span>
                          <span className="ml-2 whitespace-pre-wrap text-xs">
                            {typeof arg === "object" && arg !== null ? JSON.stringify(arg, null, 2) : String(arg)}
                          </span>
                        </div>
                      ))}
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
                      {data.error ? (
                        <div className="flex-grow whitespace-pre-wrap border border-red-500 p-2 font-mono text-xs">
                          {data.error.message}
                        </div>
                      ) : (
                        <p className="text-2xs uppercase text-white/60">No error</p>
                      )}
                    </div>
                  </>
                ) : null}

                {!data.error ? (
                  <>
                    <Separator className="my-5" />

                    <div className="flex items-start gap-x-4 pb-2">
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
                                          <span className="flex-shrink-0 text-xs text-white/60">{key}: </span>
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
                        <p className="text-2xs uppercase text-white/60">No logs</p>
                      )}
                    </div>
                  </>
                ) : null}

                {data.write && <Timing {...data.write} />}
              </>
            )}
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

function Timing({ time: start, events }: Write) {
  const maxLen = Math.max(...events.map((event) => event.time - start));

  const eventPriority = {
    write: 1,
    "write:result": 2,
    waitForTransaction: 3,
    "waitForTransaction:result": 4,
    waitForTransactionReceipt: 5,
    "waitForTransactionReceipt:result": 6,
  };

  const eventMap = events.reduce(
    (acc, event) => {
      acc[event.type] = event.time;
      return acc;
    },
    {} as Record<string, number>,
  );

  const groupedEvents = events.reduce(
    (acc, event) => {
      const baseType = event.type.split(":")[0];
      if (!acc[baseType]) {
        acc[baseType] = [];
      }
      acc[baseType].push(event);
      return acc;
    },
    {} as Record<string, typeof events>,
  );

  const sortedEvents = Object.values(groupedEvents)
    .flat()
    .sort((a, b) => {
      const priorityA = eventPriority[a.type as keyof typeof eventPriority] || Infinity;
      const priorityB = eventPriority[b.type as keyof typeof eventPriority] || Infinity;
      return priorityA - priorityB;
    });

  console.log(events);

  return (
    <>
      <Separator className="my-5" />

      <div className="flex items-start gap-x-4 pb-2">
        <h3 className="inline-block w-[45px] pb-2 text-2xs font-bold uppercase">Timing</h3>

        <div className="w-full border border-white/20 p-2 pb-3">
          <div className="grid gap-y-1">
            {sortedEvents.map((event, index) => {
              const type = event.type;
              const baseType = type.split(":")[0];
              const isResult = type.endsWith(":result");

              let duration: number;
              let startOffset: number;

              if (isResult) {
                const startTime = eventMap[baseType] || start;
                duration = event.time - startTime;
                startOffset = startTime - start;
              } else {
                duration = (eventMap[`${type}:result`] || event.time) - event.time;
                startOffset = event.time - start;
              }

              const startPercentage = (startOffset / maxLen) * 100;
              const widthPercentage = (duration / maxLen) * 100;

              if (isResult) {
                return null;
              }

              return (
                <div
                  key={index}
                  className="group grid grid-cols-[195px_1fr_70px] items-center gap-x-2 hover:bg-white/10"
                >
                  <span className="text-xs" title={type}>
                    {type}:
                  </span>
                  <div className="relative h-1">
                    <div
                      className={cn("absolute top-0 h-full bg-cyan-500", {
                        "bg-orange-500": index === 0,
                        "bg-cyan-500": index === 1,
                        "bg-green-500": index === 4,
                      })}
                      style={{
                        left: `${startPercentage}%`,
                        width: `${widthPercentage}%`,
                      }}
                    />
                  </div>
                  <span className="text-right text-xs">{duration}ms</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
