import {
  Address,
  ExtractAbiItem,
  Hex,
  RpcTransactionReceipt,
  RpcUserOperationReceipt,
  decodeEventLog,
  encodeEventTopics,
  numberToHex,
  parseEventLogs,
  zeroAddress,
} from "viem";
import { entryPoint07Abi } from "viem/account-abstraction";

const userOperationRevertReasonAbi = [
  entryPoint07Abi.find(
    (item): item is ExtractAbiItem<typeof entryPoint07Abi, "UserOperationRevertReason"> =>
      item.type === "event" && item.name === "UserOperationRevertReason",
  )!,
] as const;

const userOperationEventTopic = encodeEventTopics({
  abi: entryPoint07Abi,
  eventName: "UserOperationEvent",
});

export function getUserOperationReceipt(userOpHash: Hex, receipt: RpcTransactionReceipt): RpcUserOperationReceipt {
  const userOperationRevertReasonTopicEvent = encodeEventTopics({
    abi: userOperationRevertReasonAbi,
  })[0];

  let entryPoint: Address = zeroAddress;
  let revertReason = undefined;

  let startIndex = -1;
  let endIndex = -1;
  receipt.logs.forEach((log, index) => {
    if (log?.topics[0] === userOperationEventTopic[0]) {
      // process UserOperationEvent
      if (log.topics[1] === userOpHash) {
        // it's our userOpHash. save as end of logs array
        endIndex = index;
        entryPoint = log.address;
      } else if (endIndex === -1) {
        // it's a different hash. remember it as beginning index, but only if we didn't find our end index yet.
        startIndex = index;
      }
    }

    if (log?.topics[0] === userOperationRevertReasonTopicEvent) {
      // process UserOperationRevertReason
      if (log.topics[1] === userOpHash) {
        // it's our userOpHash. capture revert reason.
        const decodedLog = decodeEventLog({
          abi: userOperationRevertReasonAbi,
          data: log.data,
          topics: log.topics,
        });

        revertReason = decodedLog.args.revertReason;
      }
    }
  });

  if (endIndex === -1) {
    throw new Error("fatal: no UserOperationEvent in logs");
  }

  const logs = receipt.logs.slice(startIndex + 1, endIndex);

  const userOperationEvent = parseEventLogs({
    abi: entryPoint07Abi,
    eventName: "UserOperationEvent",
    args: {
      userOpHash,
    },
    logs: receipt.logs,
  })[0]!;

  let paymaster: Address | undefined = userOperationEvent.args.paymaster;
  paymaster = paymaster === zeroAddress ? undefined : paymaster;

  return {
    userOpHash,
    entryPoint,
    sender: userOperationEvent.args.sender,
    nonce: numberToHex(userOperationEvent.args.nonce),
    paymaster,
    actualGasUsed: numberToHex(userOperationEvent.args.actualGasUsed),
    actualGasCost: numberToHex(userOperationEvent.args.actualGasCost),
    success: userOperationEvent.args.success,
    reason: revertReason,
    logs,
    receipt,
  };
}
