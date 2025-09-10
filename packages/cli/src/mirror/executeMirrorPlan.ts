import { Account, Address, Chain, Client, Transport } from "viem";
import { readPlan } from "./readPlan";
import { hexToResource, resourceToLabel, writeContract } from "@latticexyz/common";
import { StoreLog } from "@latticexyz/store";
import { encodeSystemCall, worldCallAbi } from "@latticexyz/world/internal";
import batchStoreConfig from "@latticexyz/world-module-batchstore/mud.config";
import { groupBy } from "@latticexyz/common/utils";
import { waitForTransactionReceipt } from "viem/actions";
import { getWorldDeploy } from "../deploy/getWorldDeploy";

export async function executeMirrorPlan({
  planFilename,
  to: { client, world: worldAddress },
}: {
  planFilename: string;
  to: { client: Client<Transport, Chain | undefined, Account>; world: Address };
}) {
  const worldDeploy = await getWorldDeploy(client, worldAddress);
  console.log("found world deploy at", worldDeploy.address);

  const recordBatcher = createBatcher<Extract<StoreLog, { eventName: "Store_SetRecord" }>["args"]>({
    // TODO: custom onBatch function rather than batchSize to trigger on table IDs
    // TODO: send batch after certain calldata length instead of # records
    batchSize: 1000,
    async onBatch(batch) {
      for (const [tableId, records] of groupBy(batch, (record) => record.tableId).entries()) {
        console.log("writing", records.length, "records to table", resourceToLabel(hexToResource(tableId)));
        const hash = await writeContract(client, {
          chain: client.chain ?? null,
          address: worldDeploy.address,
          abi: worldCallAbi,
          functionName: "call",
          args: encodeSystemCall({
            systemId: batchStoreConfig.systems.BatchStoreSystem.systemId,
            abi: batchStoreSystemAbi,
            functionName: "setTableRecords",
            args: [tableId, records],
          }),
        });
        const receipt = await waitForTransactionReceipt(client, { hash });
        if (receipt.status === "reverted") {
          throw new Error(`Transaction ${hash} reverted.`);
        }
      }
    },
  });

  for await (const step of readPlan(planFilename)) {
    await (async () => {
      if (step.step === "mirror") {
        console.log("mirroring data from", step.worldAddress, "on chain", step.chainId);
        return;
      }

      if (step.step === "deploySystem") {
        console.log("deploying system", resourceToLabel(step.system));
        return;
      }

      if (step.step === "setRecord") {
        await recordBatcher.add(step.record);
        return;
      }
      if (step.step === "end:setRecords") {
        await recordBatcher.flush();
        return;
      }
    })();
  }

  console.log("all done!");
}

function createBatcher<item>({ batchSize, onBatch }: { batchSize: number; onBatch: (items: item[]) => Promise<void> }) {
  const items: item[] = [];
  return {
    async add(item: item) {
      items.push(item);
      if (items.length >= batchSize) {
        await this.flush();
      }
    },
    async flush() {
      await onBatch(items.splice(0, items.length));
    },
  };
}

const batchStoreSystemAbi = [
  {
    type: "function",
    name: "deleteTableRecords",
    inputs: [
      {
        name: "tableId",
        type: "bytes32",
        internalType: "ResourceId",
      },
      {
        name: "keyTuples",
        type: "bytes32[][]",
        internalType: "bytes32[][]",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getTableRecords",
    inputs: [
      {
        name: "tableId",
        type: "bytes32",
        internalType: "ResourceId",
      },
      {
        name: "keyTuples",
        type: "bytes32[][]",
        internalType: "bytes32[][]",
      },
    ],
    outputs: [
      {
        name: "records",
        type: "tuple[]",
        internalType: "struct TableRecord[]",
        components: [
          {
            name: "keyTuple",
            type: "bytes32[]",
            internalType: "bytes32[]",
          },
          {
            name: "staticData",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "encodedLengths",
            type: "bytes32",
            internalType: "EncodedLengths",
          },
          {
            name: "dynamicData",
            type: "bytes",
            internalType: "bytes",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "setTableRecords",
    inputs: [
      {
        name: "tableId",
        type: "bytes32",
        internalType: "ResourceId",
      },
      {
        name: "records",
        type: "tuple[]",
        internalType: "struct TableRecord[]",
        components: [
          {
            name: "keyTuple",
            type: "bytes32[]",
            internalType: "bytes32[]",
          },
          {
            name: "staticData",
            type: "bytes",
            internalType: "bytes",
          },
          {
            name: "encodedLengths",
            type: "bytes32",
            internalType: "EncodedLengths",
          },
          {
            name: "dynamicData",
            type: "bytes",
            internalType: "bytes",
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;
