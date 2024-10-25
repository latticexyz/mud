import { isDefined } from "@latticexyz/common/utils";
import { type Write } from "../../../../../../observer/store";

const eventConfig = {
  write: { priority: 1, label: "write" },
  "write:result": { priority: 2 },
  waitForTransaction: { priority: 3, label: "state update" },
  "waitForTransaction:result": { priority: 4 },
  waitForTransactionReceipt: { priority: 5, label: "transaction receipt" },
  "waitForTransactionReceipt:result": { priority: 6 },
  waitForUserOperationReceipt: { priority: 5, label: "user operation receipt" },
  "waitForUserOperationReceipt:result": { priority: 6 },
} as const;

type EventType = keyof typeof eventConfig;

export function useTimings({ time: start, events }: Write) {
  const maxLen = Math.max(...events.map((event) => event.time - start));
  const sortedEvents = Object.values(events).sort((a, b) => {
    const priorityA = eventConfig[a.type as EventType]?.priority;
    const priorityB = eventConfig[b.type as EventType]?.priority;
    return priorityA - priorityB;
  });

  return sortedEvents
    .map((event) => {
      const type = event.type as EventType;
      if (type.endsWith(":result")) return;

      const writeResult = events.find((e) => e.type === `${type}:result`);
      const endTime = writeResult?.time ?? event.time;
      const duration = endTime - event.time;
      const startOffset = event.time - start;

      const startPercentage = (startOffset / maxLen) * 100;
      const widthPercentage = (duration / maxLen) * 100;

      const config = eventConfig[type];
      return {
        type,
        label: "label" in config ? config.label : type,
        duration,
        startPercentage,
        widthPercentage,
      };
    })
    .filter(isDefined);
}
