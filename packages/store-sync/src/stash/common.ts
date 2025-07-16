import { defineTable } from "@latticexyz/store/internal";
import { SyncStep } from "../SyncStep";
import { getSchemaPrimitives, getValueSchema } from "@latticexyz/protocol-parser/internal";

export const SyncProgress = defineTable({
  namespaceLabel: "syncToStash",
  label: "SyncProgress",
  schema: {
    step: "string",
    percentage: "uint32",
    latestBlockNumber: "uint256",
    lastBlockNumberProcessed: "uint256",
    message: "string",
  },
  key: [],
});

export const initialProgress = {
  step: SyncStep.INITIALIZE,
  percentage: 0,
  latestBlockNumber: 0n,
  lastBlockNumberProcessed: 0n,
  message: "Connecting",
} satisfies getSchemaPrimitives<getValueSchema<typeof SyncProgress>>;
