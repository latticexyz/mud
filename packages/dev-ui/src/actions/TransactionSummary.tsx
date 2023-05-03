import { decodeEventLog, decodeFunctionData, toBytes, Hex } from "viem";
import { twMerge } from "tailwind-merge";
import { TableId } from "@latticexyz/utils";
import { keyTupleToEntityID } from "@latticexyz/network/dev";
import { useStore } from "../useStore";
import { useTransaction } from "../useTransaction";
import { PendingIcon } from "../icons/PendingIcon";
import { usePromise } from "../usePromise";
import { truncateHex } from "../truncateHex";
import { serialize } from "../serialize";

type Props = {
  hash: Hex;
};

export function TransactionSummary({ hash }: Props) {
  const { transactionPromise, transactionReceiptPromise } = useTransaction(hash);
  const transaction = usePromise(transactionPromise);
  const transactionReceipt = usePromise(transactionReceiptPromise);
  const worldAbi = useStore((state) => state.worldAbi);

  const isPending = transactionReceipt.status === "pending";
  const revertReason =
    transactionReceipt.status === "fulfilled" && transactionReceipt.value.status === "reverted"
      ? "Transaction failed" // TODO: get revert reason
      : null;

  const functionData =
    worldAbi && transaction.status === "fulfilled" && transaction.value.input
      ? decodeFunctionData({ abi: worldAbi, data: transaction.value.input })
      : null;
  const events =
    worldAbi &&
    transactionReceipt.status === "fulfilled" &&
    transactionReceipt.value.logs.map((log) => decodeEventLog({ abi: worldAbi, ...log }));

  return (
    <div>
      <div
        className={twMerge(
          "px-2 py-1 rounded flex items-center gap-2 -mx-[2px] border-2 border-transparent border-dashed",
          isPending ? "border-white/20" : revertReason ? "bg-red-800" : "bg-slate-700"
        )}
      >
        <div className="flex-1 font-mono text-white">
          {functionData?.functionName}({functionData?.args?.map((value) => serialize(value))})
        </div>
        <div className="flex-none font-mono text-xs text-white/40">tx {truncateHex(hash)}</div>
        <div className="flex-none inline-flex w-4 h-4 justify-center items-center font-bold">
          {isPending ? <PendingIcon /> : revertReason ? <>⚠</> : <>✓</>}
        </div>
      </div>
      {revertReason ? <div className="p-2">{revertReason}</div> : null}
      {events?.length ? (
        <div className="p-2">
          <table className="w-full table-fixed">
            <thead className="bg-slate-800 text-amber-200/80 text-left">
              <tr>
                <th className="font-semibold uppercase text-xs w-3/12">table</th>
                <th className="font-semibold uppercase text-xs w-[1em]"></th>
                <th className="font-semibold uppercase text-xs w-3/12">key</th>
                <th className="font-semibold uppercase text-xs">value</th>
              </tr>
            </thead>
            <tbody className="font-mono text-xs">
              {events?.map(({ eventName, args }, i) => {
                const table = TableId.fromBytes32(toBytes(args.table));
                return (
                  <tr key={i}>
                    <td className="whitespace-nowrap overflow-hidden text-ellipsis">
                      {table.namespace}:{table.name}
                    </td>
                    <td className="whitespace-nowrap">
                      {eventName === "StoreSetRecord" ? <span className="text-green-500 font-bold">=</span> : null}
                      {eventName === "StoreSetField" ? <span className="text-green-500 font-bold">+</span> : null}
                      {eventName === "StoreDeleteRecord" ? <span className="text-red-500 font-bold">-</span> : null}
                    </td>
                    <td className="whitespace-nowrap overflow-hidden text-ellipsis">{keyTupleToEntityID(args.key)}</td>
                    <td className="whitespace-nowrap overflow-hidden text-ellipsis">{args.data}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
