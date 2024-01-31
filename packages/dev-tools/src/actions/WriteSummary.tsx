import { decodeEventLog, AbiEventSignatureNotFoundError, decodeFunctionData, Hex } from "viem";
import { twMerge } from "tailwind-merge";
import { isDefined } from "@latticexyz/common/utils";
import { PendingIcon } from "../icons/PendingIcon";
import { usePromise } from "@latticexyz/react";
import { truncateHex } from "../truncateHex";
import { serialize } from "../serialize";
import { getTransaction } from "./getTransaction";
import { getTransactionReceipt } from "./getTransactionReceipt";
import { getTransactionResult } from "./getTransactionResult";
import { ErrorTrace } from "../ErrorTrace";
import { ContractWrite, hexToResource } from "@latticexyz/common";
import { useDevToolsContext } from "../DevToolsContext";
import { hexKeyTupleToEntity } from "@latticexyz/store-sync/recs";

type Props = {
  write: ContractWrite;
};

// TODO: show block number or relative timestamp (e.g. 3s ago)

export function WriteSummary({ write }: Props) {
  const { publicClient, worldAbi } = useDevToolsContext();
  const blockExplorer = publicClient.chain.blockExplorers?.default.url;

  const hash = usePromise(write.result);
  const transactionPromise = getTransaction(publicClient, write);
  const transactionReceiptPromise = getTransactionReceipt(publicClient, write);
  const transactionResultPromise = getTransactionResult(publicClient, worldAbi, write);
  const transaction = usePromise(transactionPromise);
  const transactionReceipt = usePromise(transactionReceiptPromise);
  const transactionResult = usePromise(transactionResultPromise);

  const isPending = hash.status === "pending" || transactionReceipt.status === "pending";
  const isRevert =
    hash.status === "rejected" ||
    (transactionReceipt.status === "fulfilled" && transactionReceipt.value.status === "reverted");

  // TODO: move all this into their getTransaction functions
  const returnData = transactionResult.status === "fulfilled" ? transactionResult.value.result : null;
  const events =
    worldAbi && transactionReceipt.status === "fulfilled"
      ? transactionReceipt.value.logs
          .map((log) => {
            try {
              return decodeEventLog({ abi: worldAbi, ...log });
            } catch (error) {
              // viem throws if there's no ABI for event, which can happen for events defined outside of MUD (e.g. custom worlds)
              // TODO: show these logs anyway with a note that they couldn't be parsed
              if (error instanceof AbiEventSignatureNotFoundError) {
                return;
              }
              throw error;
            }
          })
          .filter(isDefined)
      : null;

  let functionName = write.request.functionName;
  let functionArgs = write.request.args;
  if (functionName === "call" || functionName === "callFrom") {
    const functionSelectorAndArgs: Hex = write.request?.args?.length
      ? (write.request.args[write.request.args.length - 1] as Hex)
      : `0x`;
    const functionData = decodeFunctionData({ abi: worldAbi, data: functionSelectorAndArgs });
    functionName = functionData.functionName;
    functionArgs = functionData.args;
  }

  return (
    <details
      onToggle={(event) => {
        if (event.currentTarget.open) {
          console.log("transaction", transaction);
          console.log("transaction receipt", transactionReceipt);
          console.log("transaction result", transactionResult);
        }
      }}
    >
      <summary
        className={twMerge(
          "px-2 py-1 rounded flex items-center gap-2 border-2 border-transparent border-dashed cursor-pointer",
          isPending ? "border-white/20 cursor-default" : isRevert ? "bg-red-800" : "bg-slate-700"
        )}
      >
        <div className="flex-1 font-mono text-white whitespace-nowrap overflow-hidden text-ellipsis">
          {functionName}({functionArgs?.map((value) => serialize(value)).join(", ")}){" "}
          {write.request.functionName !== functionName ? (
            <span className="text-xs text-white/40">via {write.request.functionName}</span>
          ) : null}
        </div>
        {transactionReceipt.status === "fulfilled" ? (
          <a
            href={
              blockExplorer ? `${blockExplorer}/block/${transactionReceipt.value.blockNumber.toString()}` : undefined
            }
            target="_blank"
            className={twMerge(
              "flex-none font-mono text-xs text-white/40",
              blockExplorer ? "hover:text-white/60 hover:underline" : null
            )}
            title={transactionReceipt.value.blockNumber.toString()}
          >
            block {transactionReceipt.value.blockNumber.toString()}
          </a>
        ) : null}
        {hash.status === "fulfilled" ? (
          <a
            href={blockExplorer ? `${blockExplorer}/tx/${hash.value}` : undefined}
            target="_blank"
            className={twMerge(
              "flex-none font-mono text-xs text-white/40",
              blockExplorer ? "hover:text-white/60 hover:underline" : null
            )}
            title={hash.value}
          >
            tx {truncateHex(hash.value)}
          </a>
        ) : null}
        <div className="flex-none inline-flex w-4 h-4 justify-center items-center font-bold">
          {isPending ? <PendingIcon /> : isRevert ? <>⚠</> : <>✓</>}
        </div>
      </summary>
      <div className="p-2 space-y-1">
        <div className="font-bold text-white/40 uppercase text-xs">Result</div>
        {transactionResult.status === "fulfilled" ? (
          <div className="font-mono">{serialize(returnData)}</div>
        ) : transactionResult.status === "rejected" ? (
          <ErrorTrace error={transactionResult.reason} />
        ) : (
          <PendingIcon />
        )}
      </div>
      {events?.length ? (
        <div className="p-2 space-y-1">
          <div className="font-bold text-white/40 uppercase text-xs">Store events</div>
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
              {events.map(({ eventName, args }, i) => {
                const table = hexToResource((args as any).tableId);
                // TODO: dedupe this with logs table so we can get both rendering the same
                return (
                  <tr key={i}>
                    <td className="whitespace-nowrap overflow-hidden text-ellipsis">
                      {table.namespace}:{table.name}
                    </td>
                    <td className="whitespace-nowrap">
                      {eventName === "Store_SetRecord" ? <span className="text-green-500 font-bold">=</span> : null}
                      {eventName === "Store_SpliceStaticData" || eventName === "Store_SpliceDynamicData" ? (
                        <span className="text-green-500 font-bold">+</span>
                      ) : null}
                      {eventName === "Store_DeleteRecord" ? <span className="text-red-500 font-bold">-</span> : null}
                    </td>
                    <td className="whitespace-nowrap overflow-hidden text-ellipsis">
                      {hexKeyTupleToEntity((args as any).keyTuple)}
                    </td>
                    <td className="whitespace-nowrap overflow-hidden text-ellipsis">{(args as any).data}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </details>
  );
}
