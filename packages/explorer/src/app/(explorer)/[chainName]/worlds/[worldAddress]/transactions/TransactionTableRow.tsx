import { Abi } from "viem";
import { Row, flexRender } from "@tanstack/react-table";
import { Separator } from "../../../../../../components/ui/Separator";
import { TableCell, TableRow } from "../../../../../../components/ui/Table";
import { TruncatedHex } from "../../../../../../components/ui/TruncatedHex";
import { WatchedTransaction } from "./TransactionsTable";
import { columns } from "./columns";

function TranctionTableRowDataCell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="pb-2 text-xs font-bold uppercase text-muted-foreground">{label}</h3>
      <p className="text-xs uppercase">{children ?? "Not found"}</p>
    </div>
  );
}

export function TransactionTableRow({ row }: { row: Row<WatchedTransaction>; abi: Abi }) {
  const data = row.original;

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
                <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6">
                  <TranctionTableRowDataCell label="Block number">
                    {data?.receipt?.blockNumber.toString()}
                  </TranctionTableRowDataCell>
                  <TranctionTableRowDataCell label="Tx hash">
                    <TruncatedHex hex={data.transaction.hash} />
                  </TranctionTableRowDataCell>
                  <TranctionTableRowDataCell label="From">
                    <TruncatedHex hex={data.transaction.from} />
                  </TranctionTableRowDataCell>
                  <TranctionTableRowDataCell label="Tx value">
                    {data.transaction.value.toString()}
                  </TranctionTableRowDataCell>
                  <TranctionTableRowDataCell label="Gas used">
                    {data?.receipt?.gasUsed.toString()}
                  </TranctionTableRowDataCell>
                  <TranctionTableRowDataCell label="Base fee">
                    {data?.transaction?.maxFeePerGas?.toString()}
                  </TranctionTableRowDataCell>
                  <TranctionTableRowDataCell label="Priority fee">
                    {data?.transaction?.maxFeePerGas?.toString()}
                  </TranctionTableRowDataCell>
                  <TranctionTableRowDataCell label="Gas price">
                    {data.receipt?.effectiveGasPrice.toString()}
                  </TranctionTableRowDataCell>
                  <TranctionTableRowDataCell label="Total fee">TODO:</TranctionTableRowDataCell>
                </div>

                <Separator className="mt-6" />

                <div className="mt-6">
                  <h3 className="pb-2 text-xs font-bold uppercase text-muted-foreground">Errors:</h3>
                  <p className="text-sm">{data.status === "success" ? "No errors" : "Transaction failed"}</p>
                </div>

                <Separator className="mt-6" />

                <div className="mt-6 pb-2">
                  <h3 className="pb-2 text-xs font-bold uppercase text-muted-foreground">Inputs:</h3>

                  <div className="mt-2 border border-white/20 p-2">
                    {data.functionData.args?.map((arg, idx) => (
                      <div key={idx} className="flex">
                        <span className="flex-shrink-0 text-xs text-muted-foreground">arg {idx + 1}:</span>
                        <span className="ml-2 text-xs">{arg}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator className="mt-6" />

                <div className="mt-6">
                  <h3 className="pb-2 text-xs font-bold uppercase text-muted-foreground">Logs:</h3>
                  <div className="mt-2 break-all border border-white/20 p-2">
                    {Array.isArray(data.logs) && data.logs.length > 0 && (
                      <ul>
                        {data.logs.map((eventLog, idx) => (
                          <li key={idx}>
                            <span className="text-xs">{eventLog.eventName}:</span>
                            <ul className="list-inside pt-1">
                              {Object.entries(eventLog.args).map(([key, value]) => (
                                <li key={key} className="mt-1 flex">
                                  <span className="flex-shrink-0 text-xs text-muted-foreground">{key}: </span>
                                  <span className="ml-2 text-xs">{value}</span>
                                </li>
                              ))}
                            </ul>

                            {idx < data.logs.length - 1 && <Separator className="my-4" />}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </>
            )}
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
